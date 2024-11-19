// pages/login.js
import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import * as Headless from "@headlessui/react";

export default function Login() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [authMethod, setAuthMethod] = useState("phone"); // Default to 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  

  const Listbox = Headless.Listbox || Headless.default?.Listbox || (() => null);
  const ListboxLabel =
    Headless.ListboxLabel ||
    Headless.default?.ListboxLabel ||
    Listbox.Label ||
    (() => null);
  const ListboxButton =
    Headless.ListboxButton ||
    Headless.default?.ListboxButton ||
    Listbox.Button ||
    (() => null);
  const ListboxOptions =
    Headless.ListboxOptions ||
    Headless.default?.ListboxOptions ||
    Listbox.Options ||
    (() => null);
  const ListboxOption =
    Headless.ListboxOption ||
    Headless.default?.ListboxOption ||
    Listbox.Option ||
    (() => null);

  // Redirect authenticated users to /medications
  useEffect(() => {
    if (session) {
      router.push("/medications");
    }
  }, [session, router]);

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
        setMessage({
          type: "error",
          text: "Please enter a valid email address.",
        });
        return false;
      }
    } else {
      const phoneRegex = /^\+61\d{9}$/; // Australian phone number format
      if (!phoneRegex.test(formatPhoneNumber(phone))) {
        setMessage({
          type: "error",
          text: "Please enter a valid Australian phone number.",
        });
        return false;
      }
    }

    // Ensure at least one contact method is provided
    if (!email && !phone) {
      setMessage({
        type: "error",
        text: "Please provide either an email or a mobile number.",
      });
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
          text: `OTP has been sent via ${
            authMethod === "email" ? "Email" : "SMS"
          }. Please check your ${
            authMethod === "email" ? "inbox" : "messages"
          }.`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
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


      if (insertError) {
        setMessage({ type: "error", text: insertError.message });
      } else {
        setMessage({
          type: "success",
          text: "Registration successful! Redirecting...",
        });
        setTimeout(() => {
          router.push("/medications");
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
    

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-cyan-600 via-sky-300 to-primary px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <>
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          <div className="flex justify-center mb-6">
            <button
              onClick={() => setAuthMethod("phone")}
              className={`px-4 py-2 mr-2 rounded ${
                authMethod === "phone"
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } focus:outline-none`}
            >
              Phone
            </button>
            <button
              onClick={() => setAuthMethod("email")}
              className={`px-4 py-2 rounded ${
                authMethod === "email"
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } focus:outline-none`}
            >
              Email
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
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
              {loading
                ? "Sending OTP..."
                : `Send OTP via ${authMethod === "email" ? "Email" : "SMS"}`}
            </button>
          </form>
        </>
      </div>
    </div>
  );
}
