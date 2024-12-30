import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import Grid from '@mui/material/Grid2';

import { TestCase } from "../types/junit";

interface TestCaseItemProps {
  testCase: TestCase;
}

export function TestCaseItem({ testCase }: TestCaseItemProps) {
  let icon = <CheckCircleIcon color="success" />;
  let statusText = "Passed";
  let details = null;

  if (testCase.failure) {
    icon = <CancelIcon color="error" />;
    statusText = "Failed";
    details = (
      <>
        <Typography variant="subtitle2" color="error">
          {testCase.failure.message}
        </Typography>
        {testCase.failure.text && (
          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              bgcolor: "grey.100",
              p: 1,
              borderRadius: 1,
              mt: 1,
            }}
          >
            {testCase.failure.text}
          </Typography>
        )}
      </>
    );
  } else if (testCase.error) {
    icon = <ErrorIcon color="error" />;
    statusText = "Error";
    details = (
      <>
        <Typography variant="subtitle2" color="error">
          {testCase.error.message}
        </Typography>
        {testCase.error.text && (
          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              bgcolor: "grey.100",
              p: 1,
              borderRadius: 1,
              mt: 1,
            }}
          >
            {testCase.error.text}
          </Typography>
        )}
      </>
    );
  } else if (testCase.skipped) {
    icon = <SkipNextIcon color="warning" />;
    statusText = "Skipped";
  }

  return (
    <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Box>
            <Typography>{testCase.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {testCase.classname} • {statusText} • {testCase.time.toFixed(3)}s
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {details}
        {testCase.properties && testCase.properties.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Properties
            </Typography>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              {testCase.properties.map((prop, index) => (
                <Grid size={12} key={`${prop.name}-${index}`}>
                  <Grid container>
                    <Grid size={3}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {prop.name}:
                      </Typography>
                    </Grid>
                    <Grid size={9}>
                      <Typography variant="body2">
                        {prop.value || prop.text}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {testCase.systemOut && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              System Output
            </Typography>
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                bgcolor: "grey.100",
                p: 1,
                borderRadius: 1,
                mt: 1,
              }}
            >
              {testCase.systemOut}
            </Typography>
          </>
        )}
        {testCase.systemErr && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              System Error
            </Typography>
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                bgcolor: "grey.100",
                p: 1,
                borderRadius: 1,
                mt: 1,
              }}
            >
              {testCase.systemErr}
            </Typography>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
