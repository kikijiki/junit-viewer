import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import React, { useState, useMemo } from "react";
import { Virtuoso } from 'react-virtuoso';

import { JUnitReport } from "../types/junit";

import { StatusChip } from "./StatusChip";
import { TestCaseItem } from "./TestCaseItem";

interface TestReportProps {
  report: JUnitReport;
}

export function TestReport({ report }: TestReportProps) {
  const [filters, setFilters] = useState<string[]>(['passed', 'failed', 'error', 'skipped']);
  const [activeTab, setActiveTab] = useState(0);

  const successRate = report.tests > 0 ? 
    ((report.tests - report.failures - report.errors - report.skipped) / report.tests) * 100 : 
    0;
  const successCount =
    report.tests - report.failures - report.errors - report.skipped;

  const toggleFilter = (filter: string) => {
    setFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      }
      return [...prev, filter];
    });
  };

  const filteredTestcases = useMemo(() => {
    return report.testsuites.map(suite => ({

      ...suite,
      testcases: suite.testcases.filter(test => {
        if (filters.length === 0) return true;
        if (filters.includes("passed") && !test.failure && !test.error && !test.skipped) return true;
        if (filters.includes("failed") && test.failure) return true;
        if (filters.includes("error") && test.error) return true;
        if (filters.includes("skipped") && test.skipped) return true;
        return false;
      })
    }));
  }, [report.testsuites, filters]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{
        borderRight: 1,
        borderColor: 'divider',
        minWidth: 300,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ pr: 1, pb:1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            SUMMARY
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" color="success.main">
              {successCount} passed
            </Typography>
            {report.failures > 0 && (
              <Typography variant="body2" color="error.main">
                {report.failures} failed
              </Typography>
            )}
            {report.errors > 0 && (
              <Typography variant="body2" color="error.main">
                {report.errors} errors
              </Typography>
            )}
            {report.skipped > 0 && (
              <Typography variant="body2" color="warning.main">
                {report.skipped} skipped
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              of {report.tests} tests
            </Typography>
          </Stack>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={successRate}
              sx={{ flexGrow: 1 }}
              color={successRate === 100 ? "success" : "primary"}
            />
            <Typography variant="body2" color="text.secondary">
              {successRate.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              alignItems: 'flex-start',
              textAlign: 'left'
            }
          }}
        >
          {report.testsuites.map((suite, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ 
                  width: '100%',
                  minWidth: 0
                }}>
                  <Typography
                    sx={{
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      width: '100%',
                      direction: 'rtl',
                      textAlign: 'left'
                    }}
                    title={suite.name}
                  >
                    {suite.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="success.main">
                      {suite.tests - suite.failures - suite.errors - suite.skipped} passed
                    </Typography>
                    {suite.failures > 0 && (
                      <Typography variant="body2" color="error.main">
                        {suite.failures} failed
                      </Typography>
                    )}
                    {suite.errors > 0 && (
                      <Typography variant="body2" color="error.main">
                        {suite.errors} errors
                      </Typography>
                    )}
                    {suite.skipped > 0 && (
                      <Typography variant="body2" color="warning.main">
                        {suite.skipped} skipped
                      </Typography>
                    )}
                  </Stack>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={((suite.tests - suite.failures - suite.errors - suite.skipped) / suite.tests) * 100}
                      sx={{ flex: 1, mr: 1 }}
                      color={(suite.tests - suite.failures - suite.errors - suite.skipped) === suite.tests ? "success" : "primary"}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {(((suite.tests - suite.failures - suite.errors - suite.skipped) / suite.tests) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <StatusChip
            label="Passed"
            icon={<CheckCircleIcon />}
            color="success"
            filter="passed"
            filters={filters}
            onToggle={toggleFilter}
            count={successCount}
          />
          <StatusChip
            label="Failed"
            icon={<CancelIcon />}
            color="error"
            filter="failed"
            filters={filters}
            onToggle={toggleFilter}
            count={report.failures}
          />
          <StatusChip
            label="Error"
            icon={<ErrorIcon />}
            color="error"
            filter="error"
            filters={filters}
            onToggle={toggleFilter}
            count={report.errors}
          />
          <StatusChip
            label="Skipped"
            icon={<SkipNextIcon />}
            color="warning"
            filter="skipped"
            filters={filters}
            onToggle={toggleFilter}
            count={report.skipped}
          />
        </Stack>

        {report.testsuites.map((_suite, index) => (
          <Box
            key={index}
            role="tabpanel"
            hidden={activeTab !== index}
            sx={{ height: 'calc(100% - 48px)' }}
          >
            {activeTab === index && (
              <Virtuoso
                style={{ height: '100%' }}
                data={filteredTestcases[index].testcases}
                itemContent={(index, testCase) => (
                  <TestCaseItem key={index} testCase={testCase} />
                )}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
