export interface JUnitXMLTestCase {
    name: string;
    classname: string;
    time: string;
    properties?: JUnitXMLProperties;
    failure?: {
        message?: string;
        type?: string;
        _?: string;
    };
    error?: {
        message?: string;
        type?: string;
        _?: string;
    };
    skipped?: {};
    "system-out"?: string;
    "system-err"?: string;
}

export interface JUnitXMLProperty {
    name: string;
    value?: string;
    _?: string;
}

export interface JUnitXMLProperties {
    property: JUnitXMLProperty | JUnitXMLProperty[];
}

export interface JUnitXMLTestSuite {
    name: string;
    tests: string;
    failures: string;
    errors: string;
    skipped: string;
    time: string;
    timestamp: string;
    testcase?: JUnitXMLTestCase | JUnitXMLTestCase[];
    testsuite?: JUnitXMLTestSuite | JUnitXMLTestSuite[];
}

export interface JUnitXMLRoot {
    testsuites?: {
        name?: string;
        tests: string;
        failures: string;
        errors: string;
        skipped: string;
        time: string;
        timestamp: string;
        testsuite: JUnitXMLTestSuite[];
    };
    testsuite?: JUnitXMLTestSuite;
}
