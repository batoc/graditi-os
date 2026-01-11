import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SEQUENCES_COLLECTION = 'sequences';

export async function getNextCode(prefix: string, counterName: string): Promise<string> {
    const sequenceRef = doc(db, SEQUENCES_COLLECTION, counterName);

    try {
        const newCount = await runTransaction(db, async (transaction) => {
            const sequenceDoc = await transaction.get(sequenceRef);
            let count = 1;

            if (sequenceDoc.exists()) {
                const data = sequenceDoc.data();
                if (data.value) {
                    count = data.value + 1;
                }
            }

            transaction.set(sequenceRef, { value: count }, { merge: true });
            return count;
        });

        const paddedCount = newCount.toString().padStart(3, '0');
        return `${prefix}-${paddedCount}`;
    } catch (e) {
        console.error("Error generating next code", e);
        // Fallback random if transaction fails (should be rare)
        return `${prefix}-${Date.now().toString().slice(-4)}`;
    }
}
