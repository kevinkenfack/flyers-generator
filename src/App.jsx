import NotificationSystem from './components/NotificationSystem';
import LoadingOverlay from './components/LoadingOverlay';
import ImageUploader from './components/ImageUploader';
import ImageCropper from './components/ImageCropper';
import FlyerPreview from './components/FlyerPreview';
import ActionButtons from './components/ActionButtons';

function App() {
  return (
    <div className="App">
      {/* Notification system to display user feedback */}
      <NotificationSystem />

      {/* Overlay for loading states */}
      <LoadingOverlay />

      {/* Main UI for uploading and editing images */}
      <div className="editor-container">
        <ImageUploader />
        <ImageCropper />
        <FlyerPreview />
        <ActionButtons />
      </div>
    </div>
  );
}

export default App;