import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const paperSx = {
  p: 4,
  mb: 3,
  borderRadius: 3,
  boxShadow: 6,
  bgcolor: 'background.paper',
  textAlign: 'center',
};

const iconSx = {
  fontSize: 80,
  mb: 3,
  color: 'primary.main',
};

export const TtsLandingPage: React.FC = () => {
  return (
    <Box className='flex flex-col items-center justify-center p-6 max-w-3xl mx-auto min-h-[calc(100vh-128px)]'>
      <Paper sx={paperSx}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <RecordVoiceOverIcon sx={iconSx} />
          <Typography variant='h4' component='h1' gutterBottom className='font-bold text-primary-main'>
            Google Gemini Text-to-Speech
          </Typography>
          <Typography variant='body1' className='text-text-secondary mb-4 max-w-xl'>
            Generate high-quality, natural-sounding speech from your text inputs. Configure multiple speakers with unique voice profiles and languages. Ideal for creating dialogue, audio content, or accessibility features.
          </Typography>
          <Typography variant='body2' className='text-text-secondary mb-6'>
            This tool leverages Google Gemini's advanced Text-to-Speech capabilities, offering a wide range of voices and precise control over speech synthesis.
          </Typography>
          <Button
            component={RouterLink}
            to="/tts-generator"
            variant="contained"
            color="primary"
            size="large"
            className='py-3 px-8 text-lg font-bold'
          >
            Start Generating Speech
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
