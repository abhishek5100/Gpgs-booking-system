import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import ListData from './components/BookingForm';

function App() {
  const queryClient =  new QueryClient()
  return (
    <div>
      <QueryClientProvider client={queryClient}>
      <ListData/>
      </QueryClientProvider>

    </div>
  );
}

export default App;
