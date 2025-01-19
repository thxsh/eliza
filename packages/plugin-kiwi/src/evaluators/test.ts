import { Evaluator } from "@elizaos/core";

export const testEvaluator: Evaluator = {
    name: "TEST_EVALUATOR",
    description: "Test evaluator",
    similes: ["TEST_EVALUATOR"],
    validate: async () => {
        return true;
    },
    handler: async () => {
        return "TEST_EVALUATOR";
    },
    examples: [],
};
