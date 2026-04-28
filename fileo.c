#include <stdio.h>
#include "fileio.h"
#include "storage.h"

void saveToFile(void) {
    FILE *file = fopen("productivity_log.txt", "w");
    if (!file) {
        printf("\n[!] Could not open file for writing.\n");
        return;
    }

    fprintf(file, "====== PRODUCTIVITY LOG (v2 Fixed) ======\n");
    fprintf(file, "Total Days: %d\n\n", logCount);

    for (int d = 0; d < logCount; d++) {
        DayLog *day = htFind(dateOrder[d]);
        if (!day) continue;

        fprintf(file, "Date: %s | Completed:%d Pending:%d Skipped:%d\n",
                day->date, day->completedCount, day->pendingCount, day->skippedCount);

        for (int i = 0; i < day->taskCount; i++) {
            Task *t = &day->tasks[i];
            const char *stat = (t->status == STATUS_COMPLETED) ? "COMPLETED" :
                               (t->status == STATUS_PENDING) ? "PENDING" : "SKIPPED";
            fprintf(file, "  [%s] %s | Diff:%d | Imp:%d | Mins:%d | Slot:%s",
                    stat, t->name, t->difficulty, t->importance,
                    t->minutesRequired, TIME_SLOTS[t->timeSlot]);
            if (t->status == STATUS_SKIPPED)
                fprintf(file, " | Reason:%s", FAILURE_REASONS[t->failureReason]);
            fprintf(file, "\n");
        }
        fprintf(file, "\n");
    }

    fclose(file);
    printf("\n[OK] Saved to 'productivity_log.txt'\n");
}
