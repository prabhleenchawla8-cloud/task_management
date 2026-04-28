#include <stdio.h>
#include "storage.h"
#include "insights.h"
#include "scheduling.h"
#include "knapsack.h"
#include "fileio.h"

void showMenu(void) {
    printf("   Context-Aware Productivity\n");
    printf("  1. Log a new day\n");
    printf("  2. View all logged days\n");
    printf("  3. Generate Smart Schedule (Greedy)\n");
    printf("  4. Select Optimal Tasks (Knapsack)\n");
    printf("  5. Get Productivity Insights\n");
    printf("  6. Save data to file\n");
    printf("  7. Exit\n");
    printf("==============================================\n");
    printf("  Enter choice (1-7): ");
}

int main(void) {
    for (int b = 0; b < HASH_BUCKETS; b++)
        hashTable[b] = NULL;

    printf("\nWelcome to Productivity Reframer \n");

    int choice;
    do {
        showMenu();
        scanf("%d", &choice);
        while (getchar() != '\n');

        switch (choice) {
            case 1: logDay();             break;
            case 2: displayAllLogs();     break;
            case 3: generateSchedule();   break;
            case 4: selectOptimalTasks(); break;
            case 5: generateInsights();   break;
            case 6: saveToFile();         break;
            case 7:
                printf("\nGoodbye! Keep building better habits.\n\n");
                break;
            default:
                printf("\n[!] Invalid choice.\n");
        }
    } while (choice != 7);

    cleanupStorage();
    return 0;
}
