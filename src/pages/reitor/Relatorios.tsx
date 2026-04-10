import { useState, useCallback } from "react";
import { DriveFile } from "../coordenador/edudrive/types";
import EduDriveSidebar from "../coordenador/edudrive/EduDriveSidebar";
import EduDriveContent from "../coordenador/edudrive/EduDriveContent";
import EduDrivePanel from "../coordenador/edudrive/EduDrivePanel";

export default function ReitorRelatorios() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

  const navigate = useCallback((path: string[]) => {
    setCurrentPath(path);
    setSelectedFile(null);
  }, []);

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden bg-background">
      <EduDriveSidebar currentPath={currentPath} onNavigate={navigate} />
      <EduDriveContent
        currentPath={currentPath}
        onNavigate={navigate}
        onSelectFile={setSelectedFile}
        selectedFile={selectedFile}
      />
      {selectedFile && (
        <EduDrivePanel file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
}