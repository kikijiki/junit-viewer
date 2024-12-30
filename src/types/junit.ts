export interface TestCase {
    name: string;
    classname: string;
    time: number;
    properties?: {
        name: string;
        value?: string;
        text?: string;
    }[];
    failure?: {
        message?: string;
        type?: string;
        text?: string;
    };
    error?: {
        message?: string;
        type?: string;
        text?: string;
    };
    skipped?: boolean;
    systemOut?: string;
    systemErr?: string;
}

export interface TestSuite {
    name: string;
    tests: number;
    failures: number;
    errors: number;
    skipped: number;
    time: number;
    timestamp: string;
    testcases: TestCase[];
    testsuites: TestSuite[];
}

export interface JUnitReport {
    name?: string;
    tests: number;
    failures: number;
    errors: number;
    skipped: number;
    time: number;
    timestamp: string;
    testsuites: TestSuite[];
}
