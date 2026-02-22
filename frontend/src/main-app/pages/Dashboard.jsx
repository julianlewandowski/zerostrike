import LeftSidebar from '../components/layout/LeftSidebar';
import MainContent from '../components/layout/MainContent';
import RightSidebar from '../components/layout/RightSidebar';

export default function Dashboard() {
  return (
    <div className="app-body">
      <LeftSidebar />
      <MainContent />
      <RightSidebar />
    </div>
  );
}
