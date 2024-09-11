// pages/remind-me.js
import ClientLayout from '../components/ClientLayout';
import ListCards from '../components/ListCards';

export default function RemindMe() {
  return (
    <ClientLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Reminders</h1>
        <ListCards />
      </div>
    </ClientLayout>
  );
}