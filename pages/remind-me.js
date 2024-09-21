import ClientLayout from '../components/ClientLayout';
import ListCards from '../components/ListCards';
import PageTitle from '../components/PageTitle';

export default function Reminders() {
  return (
    <ClientLayout>
      <PageTitle>Reminders</PageTitle>
      <ListCards />
    </ClientLayout>
  );
}