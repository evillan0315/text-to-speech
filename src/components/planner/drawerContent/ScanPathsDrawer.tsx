import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TextField,
  List,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip,
  InputAdornment,
  useTheme,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Truncates a file path for display purposes.
 * @param filePath The full file path.
 * @param maxLength The maximum length before truncation (default: 30).
 * @returns The truncated path with '...' if necessary.
 */
const truncate = (filePath: string, maxLength: number = 30): string => {
  if (!filePath) return '';
  const parts = filePath.split(/[\\/]/); // Split by / or \\ // Double quotes escaped
  const fileName = parts[parts.length - 1];

  if (fileName.length > maxLength - 3) {
    return `...${fileName.substring(fileName.length - (maxLength - 3))}`;
  } else if (filePath.length > maxLength) {
    // If filename is short but full path is long, show beginning + filename
    const availableLength = maxLength - fileName.length - 3; // 3 for '...'
    if (availableLength > 0) {
      return `${filePath.substring(0, availableLength)}...${fileName}`;
    }
    return `...${fileName}`; // Fallback if not enough space
  }
  return filePath;
};

interface ScanPathsDrawerProps {
  currentScanPaths: string[]; // Initial paths from parent (store)
  availablePaths?: string[];
  allowExternalPaths?: boolean;
  onLocalPathsChange: (paths: string[]) => void; // Callback to notify parent of internal changes
}

const ScanPathsDrawer: React.FC<ScanPathsDrawerProps> = ({
  currentScanPaths,
  availablePaths = [],
  allowExternalPaths = false,
  onLocalPathsChange,
}) => {
  const theme = useTheme();
  // Internal state for paths, which will be committed via onLocalPathsChange
  const [localSelectedPaths, setLocalSelectedPaths] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualPathInput, setManualPathInput] = useState('');

  // Sync internal state with prop `currentScanPaths` when component mounts or prop changes
  useEffect(() => {
    setLocalSelectedPaths(currentScanPaths);
  }, [currentScanPaths]);

  // Filter available paths based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return availablePaths;
    const lower = searchTerm.toLowerCase();
    return availablePaths.filter((p) => p.toLowerCase().includes(lower));
  }, [availablePaths, searchTerm]);

  const addPath = useCallback((pathToAdd: string) => {
    if (!pathToAdd) return;
    setLocalSelectedPaths((prev) => {
      const newPaths = Array.from(new Set([...prev, pathToAdd]));
      onLocalPathsChange(newPaths); // Notify parent immediately of internal changes
      return newPaths;
    });
  }, [onLocalPathsChange]);

  const handleAddManualPath = useCallback(() => {
    const trimmed = manualPathInput.trim();
    if (!trimmed) return;
    addPath(trimmed);
    setManualPathInput('');
  }, [manualPathInput, addPath]);

  const handleRemovePath = useCallback((pathToRemove: string) => {
    setLocalSelectedPaths((prev) => {
      const newPaths = prev.filter((p) => p !== pathToRemove);
      onLocalPathsChange(newPaths); // Notify parent immediately of internal changes
      return newPaths;
    });
  }, [onLocalPathsChange]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        bgcolor: theme.palette.background.paper,
        height: '100%',
      }}
    >
      {/* Search paths */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search paths..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
              backgroundColor: theme.palette.background.default,
            }}
      />

      {/* Manual input for external paths */}
      {allowExternalPaths && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter external path..."
            value={manualPathInput}
            onChange={(e) => setManualPathInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddManualPath()}
            sx={{
              backgroundColor: theme.palette.background.default,
            }}
          />
          <Tooltip title="Add Path">
            <span>
              <IconButton
                onClick={handleAddManualPath}
                disabled={!manualPathInput.trim()}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      {/* Available paths */}
      {filteredOptions.length > 0 && (
        <>
          <Typography variant="subtitle2">Suggested Paths:</Typography>
          <List
            dense
            sx={{
              height: '100%',
              overflowY: 'auto',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
            }}
          >
            {filteredOptions.map((option) => (
              <ListItemButton
                key={option}
                selected={localSelectedPaths.includes(option)}
                onClick={() => addPath(option)}
              >
                <ListItemText primary={option} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {/* Selected paths */}
      <Typography variant="subtitle2" sx={{ mt: 1 }}>Currently Selected for Scan:</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, height: 'auto' }}>
        {localSelectedPaths.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No paths selected.</Typography>
        ) : (
          localSelectedPaths.map((pathItem) => (
            <Tooltip title={pathItem} key={pathItem}>
            <Chip
              label={truncate(pathItem)}
              onDelete={() => handleRemovePath(pathItem)}
              size="small"
              color="primary"
            />
               </Tooltip>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ScanPathsDrawer;
