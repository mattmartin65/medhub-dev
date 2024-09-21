import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Login() {
  const supabase = useSupabaseClient();
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

  useEffect(() => {
    if (newUser === "true" && clinicid && specialtyid) {
      setIsNewUser(true);
    }
  }, [newUser, clinicid, specialtyid]);

  const handleLogin = async (e) => {
    e.preventDefault();
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

  // Fetch conditions and medications from Supabase
  useEffect(() => {
    const fetchConditionsAndMedications = async () => {
      const { data: conditionsData, error: conditionsError } = await supabase
        .from("conditions")
        .select("*");
      if (conditionsError) {
        console.error("Error fetching conditions:", conditionsError);
      } else {
        setConditions(conditionsData);
      }

      const { data: medicationsData, error: medicationsError } = await supabase
        .from("medications")
        .select("*");
      if (medicationsError) {
        console.error("Error fetching medications:", medicationsError);
      } else {
        setMedications(medicationsData);
      }
    };

    fetchConditionsAndMedications();
  }, [supabase]);

  // Format phone number to ensure correct format
  const formatPhoneNumber = (phone) => {
    // Remove any spaces or non-digit characters
    phone = phone.replace(/\D/g, "");
  
    // If the number starts with '0', remove it and add country code '+61'
    if (phone.startsWith("0")) {
      phone = phone.substring(1);
      phone = "+61" + phone;
    }
  
    // If the number already starts with '+', return as is
    if (!phone.startsWith("+")) {
      phone = "+61" + phone; // Default to Australian country code
    }
  
    return phone;
  };

  // Handle user registration (for new users)
  const handleOnboarding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Create a new user in Supabase Auth
      const { data: user, error: userError } = await supabase.auth.signUp({
        email: authMethod === "email" ? email : null,
        phone: authMethod === "phone" ? formatPhoneNumber(phone) : null,
        password: Math.random().toString(36).slice(-8), // Temporary password
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
            mobile: authMethod === "phone" ? phone : null,
            email: authMethod === "email" ? email : null,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-500 via-sky-300 to-sky-800 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {isNewUser ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Medhub</h2>
            <h2 className="text-lg mb-6 text-center">Please complete the details below</h2>
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
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-sky-300"
                    placeholder="0400 123 456"
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
                    required
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
      {cond.conditionName} {/* Display conditionName */}
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
                  {medications.map((med) => (
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
                  <label className="mr-4">
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
                  <label>
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
                    required
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
                    required
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
                className="w-full bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-600 transition-colors disabled:opacity-50"
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