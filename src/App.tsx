import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Tabs,
  Tab,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
} from "@mui/material";
import { XMLParser } from "fast-xml-parser";
import { useState, useEffect, useCallback } from "react";

import { FileDropZone } from "./components/FileDropZone";
import { TestReport } from "./components/TestReport";
import { JUnitReport, TestCase, TestSuite } from "./types/junit";
import { JUnitXMLRoot, JUnitXMLTestSuite, JUnitXMLTestCase } from "./types/xml";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ReportTab {
  id: string;
  name: string;
  report?: JUnitReport;
}

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function App() {
  const [tabs, setTabs] = useState<ReportTab[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const handleCloseTab = useCallback((tabIndex: number) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((_, i) => i !== tabIndex);
      if (tabIndex <= activeTab && activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
      return newTabs;
    });
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "w") {
        event.preventDefault();
        handleCloseTab(activeTab);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handleCloseTab]);

  const handleFileSelect = async (files: File[]) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "_",
      isArray: (name) => ["testsuite", "testcase", "property"].includes(name.toLowerCase()),
    });

    const newTabs: ReportTab[] = [];
    for (const file of files) {
      try {
        const text = await file.text();
        const result = parser.parse(text) as JUnitXMLRoot;

        let junitReport: JUnitReport;

        if (result.testsuites) {
          const suites = Array.isArray(result.testsuites.testsuite)
            ? result.testsuites.testsuite
            : [result.testsuites.testsuite];
          const processedSuites = suites.map(processTestSuite);
          const totalTests = processedSuites.reduce(
            (sum, s) => sum + s.tests,
            0
          );
          const totalFailures = processedSuites.reduce(
            (sum, s) => sum + s.failures,
            0
          );
          const totalErrors = processedSuites.reduce(
            (sum, s) => sum + s.errors,
            0
          );
          const totalSkipped = processedSuites.reduce(
            (sum, s) => sum + s.skipped,
            0
          );
          const totalTime = processedSuites.reduce((sum, s) => sum + s.time, 0);

          junitReport = {
            name: result.testsuites.name || "Test Results",
            tests: parseInt(result.testsuites.tests) || totalTests,
            failures: parseInt(result.testsuites.failures) || totalFailures,
            errors: parseInt(result.testsuites.errors) || totalErrors,
            skipped: parseInt(result.testsuites.skipped) || totalSkipped,
            time: parseFloat(result.testsuites.time) || totalTime,
            timestamp: result.testsuites.timestamp || "",
            testsuites: processedSuites,
          };
        } else if (result.testsuite) {
          const processedSuite = processTestSuite(result.testsuite);
          junitReport = {
            name: processedSuite.name || "Test Results",
            tests: processedSuite.tests,
            failures: processedSuite.failures,
            errors: processedSuite.errors,
            skipped: processedSuite.skipped,
            time: processedSuite.time,
            timestamp: processedSuite.timestamp,
            testsuites: [processedSuite],
          };
        } else {
          throw new Error("Invalid JUnit XML format");
        }

        newTabs.push({
          id: crypto.randomUUID(),
          name: file.name,
          report: junitReport,
        });
      } catch (error) {
        console.error("Error parsing file:", error);
      }
    }

    if (newTabs.length > 0) {
      setTabs((currentTabs) => [...currentTabs, ...newTabs]);
      // Set active tab to the first new tab
      setActiveTab(tabs.length + newTabs.length - 1);
    }
  };

  const processTestSuite = (suite: JUnitXMLTestSuite): TestSuite => {
    // Recursively process nested testsuites
    const nestedSuites = suite.testsuite
      ? (Array.isArray(suite.testsuite)
          ? suite.testsuite
          : [suite.testsuite]
        ).map(processTestSuite)
      : [];
    const nestedTests = nestedSuites.reduce(
      (sum: number, s: TestSuite) => sum + s.tests,
      0
    );
    const directTests = suite.testcase
      ? Array.isArray(suite.testcase)
        ? suite.testcase.length
        : 1
      : 0;

    return {
      name: suite.name,
      tests: parseInt(suite.tests) || directTests + nestedTests,
      failures: parseInt(suite.failures) || 0,
      errors: parseInt(suite.errors) || 0,
      skipped: parseInt(suite.skipped) || 0,
      time: parseFloat(suite.time) || 0,
      timestamp: suite.timestamp || "",
      testcases: suite.testcase
        ? (Array.isArray(suite.testcase)
            ? suite.testcase
            : [suite.testcase]
          ).map(
            (tc: JUnitXMLTestCase): TestCase => ({
              name: tc.name,
              classname: tc.classname,
              time: parseFloat(tc.time) || 0,
              properties: tc.properties ? (Array.isArray(tc.properties.property)
                ? tc.properties.property
                : [tc.properties.property]
              ).map(prop => ({
                name: prop.name,
                value: prop.value,
                text: prop._
              })) : undefined,
              failure: tc.failure
                ? {
                    message: tc.failure.message || "",
                    type: tc.failure.type || "",
                    text: tc.failure._ || "",
                  }
                : undefined,
              error: tc.error
                ? {
                    message: tc.error.message || "",
                    type: tc.error.type || "",
                    text: tc.error._ || "",
                  }
                : undefined,
              skipped: !!tc.skipped,
              systemOut: tc["system-out"] || undefined,
              systemErr: tc["system-err"] || undefined,
            })
          )
        : [],
      testsuites: nestedSuites,
    };
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCloseTabWithEvent = (
    event: React.MouseEvent,
    tabIndex: number
  ) => {
    event.stopPropagation(); // Prevent tab selection when closing
    handleCloseTab(tabIndex);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              ".MuiTabs-flexContainer": {
                alignItems: "center",
              },
              flex: 1,
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span>{tab.name}</span>
                    <IconButton
                      onClick={(e) => handleCloseTabWithEvent(e, index)}
                      sx={{
                        ml: 1,
                        p: 0.25,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
                sx={{
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
            ))}
            <Tab
              label="Open"
              sx={{
                maxWidth: "100px",
                minWidth: "60px",
              }}
            />
          </Tabs>
        </Box>
        <Box sx={{ flexGrow: 1, overflow: "auto", px: 2, pt: 2 }}>
          {tabs.map((tab, tabIndex) => (
            <TabPanel key={tab.id} value={activeTab} index={tabIndex}>
              {tab.report ? (
                <TestReport report={tab.report} />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ width: "100%", maxWidth: 600 }}>
                    <FileDropZone
                      onFileSelect={(files) => handleFileSelect(files)}
                    />
                  </Box>
                </Box>
              )}
            </TabPanel>
          ))}
          <TabPanel value={activeTab} index={tabs.length}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 600 }}>
                <FileDropZone onFileSelect={handleFileSelect} />
              </Box>
            </Box>
          </TabPanel>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
