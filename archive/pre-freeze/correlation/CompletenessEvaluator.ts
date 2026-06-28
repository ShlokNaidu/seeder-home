import { RuntimeFact } from '@seeder/contracts';

export class CompletenessEvaluator {
    
    public evaluate(fact: RuntimeFact): number {
        let score = 0;
        let total = 4; // request, response, db, dom

        if (fact.requestObservationId) score++;
        if (fact.responseObservationId) score++;
        if (fact.databaseObservationId) score++;
        if (fact.domObservationId) score++;

        // A business mutation isn't valid if we didn't catch the DB change
        if (!fact.databaseObservationId) {
            return 0;
        }

        const confidence = (score / total) * 100;
        fact.confidenceScore = confidence;
        return confidence;
    }
}
