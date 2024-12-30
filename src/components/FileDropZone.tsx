import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';

const DropZone = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.grey[50],
    border: `2px dashed ${theme.palette.grey[300]}`,
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
        border: `2px dashed ${theme.palette.primary.main}`,
    },
    transition: 'all 0.3s ease-in-out',
}));

interface FileDropZoneProps {
    onFileSelect: (files: File[]) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelect }) => {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = Array.from(e.dataTransfer.files);
            onFileSelect(files);
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.xml';
        input.onchange = (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            onFileSelect(files);
        };
        input.click();
    };

    return (
        <DropZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">
                    Drop JUnit XML files here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    or click to select files
                </Typography>
            </Box>
        </DropZone>
    );
};
