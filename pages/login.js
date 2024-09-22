// pages/login.js
import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Login() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const { newUser, clinicid, specialtyid } = router.query;

  const [isNewUser, setIsNewUser] = useState(false);
  const [authMethod, setAuthMethod] = useState("phone"); // Default to 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState("");
  const [medication, setMedication] = useState("");
  const [formType, setFormType] = useState("initial"); // 'initial' or 'continuing'
  const [nextAppointment, setNextAppointment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [medications, setMedications] = useState([]);

  // Redirect authenticated users to /medications
  useEffect(() => {
    if (session) {
      router.push("/medications");
    }
  }, [session, router]);

  // Determine if the user is new based on query parameters
  useEffect(() => {
    if (newUser === "true" && clinicid && specialtyid) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
  }, [newUser, clinicid, specialtyid]);

  // Fetch conditions and medications based on specialtyid
  useEffect(() => {
    const fetchConditionsAndMedications = async () => {
      if (specialtyid) {
        // Fetch conditions filtered by specialtyId
        const { data: conditionsData, error: conditionsError } = await supabase
          .from("conditions")
          .select("*")
          .eq("specialtyId", specialtyid);

        if (conditionsError) {
          console.error("Error fetching conditions:", conditionsError);
          setMessage({ type: "error", text: "Failed to load conditions." });
        } else {
          setConditions(conditionsData);
        }

        // Fetch all medications (to be filtered based on condition selection)
        const { data: medicationsData, error: medicationsError } = await supabase
          .from("medications")
          .select("*");

        if (medicationsError) {
          console.error("Error fetching medications:", medicationsError);
          setMessage({ type: "error", text: "Failed to load medications." });
        } else {
          setMedications(medicationsData);
        }
      }
    };

    fetchConditionsAndMedications();
  }, [specialtyid, supabase]);

  // Format phone number to ensure correct format
  const formatPhoneNumber = (phone) => {
    // Remove any spaces or non-digit characters
    phone = phone.replace(/\D/g, "");

    // If the number starts with '0', remove it and add country code '+61'
    if (phone.startsWith("0")) {
      phone = phone.substring(1);
      phone = "+61" + phone;
    }

    // If the number does not start with '+', add default country code '+61'
    if (!phone.startsWith("+")) {
      phone = "+61" + phone;
    }

    return phone;
  };

  // Validate form inputs
  const validateForm = () => {
    if (authMethod === "email") {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        setMessage({ type: "error", text: "Please enter a valid email address." });
        return false;
      }
    } else {
      const phoneRegex = /^\+61\d{9}$/; // Australian phone number format
      if (!phoneRegex.test(formatPhoneNumber(phone))) {
        setMessage({ type: "error", text: "Please enter a valid Australian phone number." });
        return false;
      }
    }

    if (!condition) {
      setMessage({ type: "error", text: "Please select a condition." });
      return false;
    }

    if (!medication) {
      setMessage({ type: "error", text: "Please select a medication." });
      return false;
    }

    if (!nextAppointment) {
      setMessage({ type: "error", text: "Please select the date of your next appointment." });
      return false;
    }

    // Ensure at least one contact method is provided
    if (!email && !phone) {
      setMessage({ type: "error", text: "Please provide either an email or a mobile number." });
      return false;
    }

    return true;
  };

  // Handle login for existing users
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      let response;
      const formattedPhone = formatPhoneNumber(phone);

      if (authMethod === "email") {
        response = await supabase.auth.signInWithOtp({ email });
      } else {
        response = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      }

      if (response.error) {
        setMessage({ type: "error", text: response.error.message });
      } else {
        setMessage({
          type: "success",
          text: `OTP has been sent via ${authMethod === "email" ? "Email" : "SMS"}. Please check your ${
            authMethod === "email" ? "inbox" : "messages"
          }.`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle onboarding for new users
  const handleOnboarding = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      // Create a new user in Supabase Auth
      const { data: user, error: userError } = await supabase.auth.signUp({
        email: email || undefined,
        phone: phone ? formatPhoneNumber(phone) : undefined,
      });

      if (userError) {
        setMessage({ type: "error", text: userError.message });
        setLoading(false);
        return;
      }

      // Insert user data into 'user_profiles' table
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert([
          {
            userid: user.user.id,
            specialtyid,
            clinicid,
            conditionid: condition,
            medicationid: medication,
            formid: formType === "initial" ? "INITIAL_FORM_ID" : "CONTINUING_FORM_ID",
            dateform: nextAppointment,
            mobile: phone ? phone : null, // Set to null if email is chosen
            email: email ? email : null, // Set to null if phone is chosen
          },
        ]);

      if (insertError) {
        setMessage({ type: "error", text: insertError.message });
      } else {
        setMessage({ type: "success", text: "Registration successful! Redirecting..." });
        setTimeout(() => {
          router.push("/medications");
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-cyan-600 via-sky-300 to-primary px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {isNewUser ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Welcome to MedHub</h2>
            <h3 className="text-lg mb-6 text-center">Please complete the details below</h3>

            {/* Feedback Message */}
            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Toggle Authentication Method */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setAuthMethod("phone")}
                className={`px-4 py-2 mr-2 rounded ${
                  authMethod === "phone" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700"
                } focus:outline-none`}
              >
                Phone
              </button>
              <button
                onClick={() => setAuthMethod("email")}
                className={`px-4 py-2 rounded ${
                  authMethod === "email" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700"
                } focus:outline-none`}
              >
                Email
              </button>
            </div>

            {/* Onboarding Form */}
            <form onSubmit={handleOnboarding} className="space-y-4">
              {/* Phone or Email */}
              {authMethod === "phone" ? (
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required={authMethod === "phone"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                    placeholder="0412 345 678"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required={authMethod === "email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                    placeholder="you@example.com"
                  />
                </div>
              )}

              {/* Condition */}
              <div className="mb-4">
                <label htmlFor="condition" className="block text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  id="condition"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                >
                  <option value="">Select Condition</option>
                  {conditions.map((cond) => (
                    <option key={cond.id} value={cond.id}>
                      {cond.conditionName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medication */}
              <div className="mb-4">
                <label htmlFor="medication" className="block text-gray-700 mb-2">
                  Medication
                </label>
                <select
                  id="medication"
                  required
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                >
                  <option value="">Select Medication</option>
                  {medications
                    .filter((med) => med.conditionid === condition)
                    .map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Form Type */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Form Type</label>
                <div className="flex items-center">
                  <label className="mr-4 flex items-center">
                    <input
                      type="radio"
                      name="formType"
                      value="initial"
                      checked={formType === "initial"}
                      onChange={(e) => setFormType(e.target.value)}
                      className="mr-2"
                    />
                    Initial Script
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="formType"
                      value="continuing"
                      checked={formType === "continuing"}
                      onChange={(e) => setFormType(e.target.value)}
                      className="mr-2"
                    />
                    Continuing
                  </label>
                </div>
              </div>

              {/* Date of Next Appointment */}
              <div className="mb-4">
                <label htmlFor="nextAppointment" className="block text-gray-700 mb-2">
                  Date of Next Appointment
                </label>
                <input
                  type="date"
                  id="nextAppointment"
                  required
                  value={nextAppointment}
                  onChange={(e) => setNextAppointment(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Complete Registration"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            {/* Toggle Authentication Method */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setAuthMethod("phone")}
                className={`px-4 py-2 mr-2 rounded ${
                  authMethod === "phone" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700"
                } focus:outline-none`}
              >
                Phone
              </button>
              <button
                onClick={() => setAuthMethod("email")}
                className={`px-4 py-2 rounded ${
                  authMethod === "email" ? "bg-sky-600 text-white" : "bg-gray-200 text-gray-700"
                } focus:outline-none`}
              >
                Email
              </button>
            </div>

            {/* Feedback Message */}
            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              {authMethod === "phone" ? (
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required={authMethod === "phone"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                    placeholder="0412 345 678"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required={authMethod === "email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                    placeholder="you@example.com"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : `Send OTP via ${authMethod === "email" ? "Email" : "SMS"}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}