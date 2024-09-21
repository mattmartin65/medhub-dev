import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SendOtpTest() {
  const [username, setUsername] = useState(""); // New username state for actor_username
  const [phone, setPhone] = useState(""); // Phone number state for OTP
  const [message, setMessage] = useState(null);
  const supabase = useSupabaseClient();

  // Function to format the phone number into E.164 format (for Australia)
  const formatPhoneNumber = (phone) => {
    // Remove any leading '0' if present
    if (phone.startsWith('0')) {
      phone = phone.substring(1);
    }

    // Prepend country code if not present
    if (!phone.startsWith('+61')) {
      phone = '+61' + phone;
    }

    return phone;
  };

  // Function to trigger the OTP SMS to the formatted phone number
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear any previous messages

    try {
      // Format the phone number before sending
      const formattedPhone = formatPhoneNumber(phone);
      console.log("Formatted phone number before sending:", formattedPhone);
      console.log("Username (actor_username):", username); // Log the actor_username

      // Trigger OTP using Supabase Auth API
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone, // Use the formatted phone number
      });

      if (error) {
        setMessage({ type: "error", text: `Error: ${error.message}` });
      } else {
        setMessage({ type: "success", text: "OTP sent successfully. Check your SMS." });
        console.log("OTP sent successfully:", data);

        // Optionally save the actor_username in your own database
        // Example: Save actor_username in Supabase table for future use
        const { error: usernameError } = await supabase.from("user_profiles").insert({
          username: username,
          phone: formattedPhone,
        });

        if (usernameError) {
          console.error("Error saving username:", usernameError.message);
        } else {
          console.log("Username saved successfully.");
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: `Unexpected error: ${error.message}` });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trigger OTP and Set Username</h1>

      {/* Feedback Message */}
      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form to Input Username and Phone Number */}
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Enter a username (actor_username)"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block mb-2">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Enter your phone number (e.g., 0413025975)"
          />
        </div>

        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Send OTP
        </button>
      </form>
    </div>
  );
}