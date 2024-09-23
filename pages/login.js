// pages/login.js
import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import * as Headless from "@headlessui/react";

export default function Login() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const { newUser, clinicid, specialtyid } = router.query;

  const [isNewUser, setIsNewUser] = useState(false);
  const [authMethod, setAuthMethod] = useState("phone"); // Default to 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState(null); // Changed to null for Listbox
  const [medication, setMedication] = useState(null); // Changed to null for Listbox
  const [isFirstPrescription, setIsFirstPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [allMedications, setAllMedications] = useState([]);
  const [medications, setMedications] = useState([]);

  const Listbox = Headless.Listbox || Headless.default?.Listbox || (() => null);
  const ListboxLabel = Headless.ListboxLabel || Headless.default?.ListboxLabel || Listbox.Label || (() => null);
  const ListboxButton = Headless.ListboxButton || Headless.default?.ListboxButton || Listbox.Button || (() => null);
  const ListboxOptions = Headless.ListboxOptions || Headless.default?.ListboxOptions || Listbox.Options || (() => null);
  const ListboxOption = Headless.ListboxOption || Headless.default?.ListboxOption || Listbox.Option || (() => null);



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
          .select("*")
          .order('id');

        if (medicationsError) {
          console.error("Error fetching medications:", medicationsError);
          setMessage({ type: "error", text: "Failed to load medications." });
        } else {
          setAllMedications(medicationsData);
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

  const onConditionChange = (value) => {
    // console.log('onConditionChange', value);

    // console.log('conditions', conditions);
    // console.log('allmed', allMedications);

    const con = conditions.find((c) => c.id === value );
    let filteredMedications = [];
    if( con.medication_id && con.medication_id.length > 0 && allMedications && allMedications.length > 0 ) {
      for( let c = 0; c < con.medication_id.length; c++ ) {
        for( let m = 0; m < allMedications.length; m++ ) {
          // console.log(allMedications[m], con.medication_id[c]);
          if( allMedications[m].id === con.medication_id[c]) {
            filteredMedications.push(allMedications[m]);
          }
        }
      }
    }
    // console.log('filtered', filteredMedications);

    setCondition(value);
    setMedications(filteredMedications);
  }

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

              {/* Condition Dropdown using Listbox */}
              <div className="mb-4 relative z-20">
                <Listbox value={condition} onChange={onConditionChange}>
                  <ListboxLabel className="block text-gray-700 mb-2">Condition</ListboxLabel>
                  <div className="relative">
                    <ListboxButton className="relative w-full bg-white border border-gray-300 rounded py-2 pl-3 pr-10 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600">
                      <span className="block truncate">
                        {conditions.find((c) => c.id === condition)?.conditionName || "Select Condition"}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {/* ... (SVG icon remains unchanged) */}
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-30 mt-1 w-full bg-white shadow-lg max-h-60 rounded py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {conditions.map((cond) => (
                        <ListboxOption
                          key={cond.id}
                          className={({ active }) =>
                            `${active ? "text-white bg-sky-600" : "text-gray-900"}
                              cursor-default select-none relative py-2 pl-10 pr-4`
                          }
                          value={cond.id}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`${
                                  selected ? "font-medium" : "font-normal"
                                } block truncate`}
                              >
                                {cond.conditionName}
                              </span>
                              {selected ? (
                                <span
                                  className={`${
                                    active ? "text-white" : "text-sky-600"
                                  } absolute inset-y-0 left-0 flex items-center pl-3`}
                                >
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.35a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                        </span>
                              ) : null}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              {/* Medication Dropdown using Listbox */}
              <div className="mb-4 relative z-10">
                <Listbox value={medication} onChange={setMedication} disabled={!condition}>
                  <ListboxLabel className="block text-gray-700 mb-2">Medication</ListboxLabel>
                  <div className="relative">
                    <ListboxButton className="relative w-full bg-white border border-gray-300 rounded py-2 pl-3 pr-10 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600">
                      <span className="block truncate">
                        {medications.find((m) => m.id === medication)?.name || "Select Medication"}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.35a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {medications.map((med) => (
                          <ListboxOption
                            key={med.id}
                            className={({ active }) =>
                              `${active ? "text-white bg-sky-600" : "text-gray-900"}
                                cursor-default select-none relative py-2 pl-10 pr-4`
                            }
                            value={med.id}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`${
                                    selected ? "font-medium" : "font-normal"
                                  } block truncate`}
                                >
                                  {med.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`${
                                      active ? "text-white" : "text-sky-600"
                                    } absolute inset-y-0 left-0 flex items-center pl-3`}
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                ) : null}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Is this your first prescription?</label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setIsFirstPrescription(true)}
                    className={`flex-1 py-2 px-4 rounded-l-lg ${
                      isFirstPrescription === true
                        ? "bg-sky-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    } focus:outline-none`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFirstPrescription(false)}
                    className={`flex-1 py-2 px-4 rounded-r-lg ${
                      isFirstPrescription === false
                        ? "bg-sky-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    } focus:outline-none`}
                  >
                    No
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

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

            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

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