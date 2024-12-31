import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Box, Button, Typography, Paper, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { basename } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";

interface EmptyTabProps {
  onFileSelect: (paths: string[]) => void;
  recentFiles: string[];
}

export function EmptyTab({ onFileSelect, recentFiles }: EmptyTabProps) {
  const [fileNames, setFileNames] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const loadFileNames = async () => {
      const names: {[key: string]: string} = {};
      for (const file of recentFiles) {
        names[file] = await basename(file);
      }
      setFileNames(names);
    };
    loadFileNames();
  }, [recentFiles]);

  const handleOpenClick = async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "XML Files",
          extensions: ["xml"],
        },
      ],
    });

    if (selected) {
      onFileSelect(Array.isArray(selected) ? selected : [selected]);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        py: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
        <Typography variant="h6" component="div">
          Drop JUnit XML files anywhere
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
        <Button variant="contained" onClick={handleOpenClick}>
          Select Files
        </Button>
      </Box>

      {recentFiles.length > 0 && (
        <Paper sx={{ width: "100%", maxWidth: 600 }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            Recent Files
          </Typography>
          <List>
            {recentFiles.map((file, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => onFileSelect([file])}>
                  <ListItemText 
                    primary={fileNames[file] || file} 
                    secondary={file} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
