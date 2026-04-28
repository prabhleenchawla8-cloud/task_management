#ifndef MODELS_H
#define MODELS_H

#define MAX_TASKS          10
#define MAX_SLOTS           4
#define MAX_REASONS         5
#define MAX_LOGS          100
#define DATE_LEN           11
#define NAME_LEN           64
#define MAX_MINUTES_PER_TASK 480   

typedef enum {
    STATUS_PENDING   = 0,
    STATUS_COMPLETED = 1,
    STATUS_SKIPPED   = 2
} TaskStatus;

extern char TIME_SLOTS[MAX_SLOTS][32];
extern char FAILURE_REASONS[MAX_REASONS][64];

typedef struct {
    char name[NAME_LEN];
    int  difficulty;       
    int  importance;       
    int  minutesRequired;  /* 1 to 480 */
    int  timeSlot;         /* 0-3 */
    TaskStatus status;
    int  failureReason;    /* -1 if completed */
} Task;

typedef struct {
    char date[DATE_LEN];
    Task tasks[MAX_TASKS];
    int  taskCount;
    int  completedCount;
    int  pendingCount;
    int  skippedCount;
} DayLog;

#endif /* MODELS_H */
