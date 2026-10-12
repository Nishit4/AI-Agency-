      *================================================================*
      * PROGRAM-ID : LNFEE010                                          *
      * PURPOSE    : ASSESS THE LATE FEE ON A PAST-DUE LOAN ACCOUNT    *
      *              AND ADVANCE ITS DELINQUENCY STATUS.               *
      * CALLED BY  : LNBATCH (NIGHTLY SERVICING CYCLE)                 *
      * RETURN     : 00 = OK, 08 = INVALID INPUT, 12 = ACCOUNT CLOSED  *
      *================================================================*
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LNFEE010.
       AUTHOR. LOAN-SERVICING-SYSTEMS.
       ENVIRONMENT DIVISION.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CONSTANTS.
           05  WS-GRACE-DAYS              PIC 9(3)          VALUE 15.
           05  WS-MAX-DAYS                PIC 9(3)          VALUE 999.
           05  WS-FEE-RATE                PIC V999   COMP-3 VALUE .050.
           05  WS-FEE-CAP                 PIC S9(5)V99 COMP-3
                                                            VALUE 25.00.
           05  WS-DELINQ-DAYS             PIC 9(3)          VALUE 30.
           05  WS-CHARGEOFF-DAYS          PIC 9(3)          VALUE 90.
       01  WS-WORK.
           05  WS-RAW-FEE                 PIC S9(9)V99 COMP-3
                                                            VALUE ZERO.
           05  WS-NEW-RANK                PIC 9             VALUE ZERO.
           05  WS-CUR-RANK                PIC 9             VALUE ZERO.
       LINKAGE SECTION.
           COPY LNFEEREC.
       PROCEDURE DIVISION USING LN-FEE-REQUEST LN-FEE-RESPONSE.
       0000-MAIN.
           MOVE '00'            TO LN-RETURN-CODE
           MOVE SPACES          TO LN-ERROR-CODE
           MOVE ZERO            TO LN-LATE-FEE
           MOVE 'N'             TO LN-FEE-ASSESSED
           MOVE LN-ACCT-STATUS  TO LN-NEW-STATUS
           PERFORM 1000-VALIDATE
           IF LN-RETURN-CODE = '00'
              PERFORM 2000-CALC-FEE
              PERFORM 3000-ADVANCE-STATUS
           END-IF
           GOBACK.
      *----------------------------------------------------------------*
      * 1000-VALIDATE : FIRST FAILING CHECK WINS; ORDER IS SIGNIFICANT *
      *----------------------------------------------------------------*
       1000-VALIDATE.
           EVALUATE TRUE
              WHEN NOT LN-STATUS-VALID
                 MOVE '08'                   TO LN-RETURN-CODE
                 MOVE 'INVALID_STATUS'       TO LN-ERROR-CODE
              WHEN LN-STATUS-CLOSED
                 MOVE '12'                   TO LN-RETURN-CODE
                 MOVE 'ACCOUNT_CLOSED'       TO LN-ERROR-CODE
              WHEN LN-OUTSTANDING-BAL < ZERO
                 MOVE '08'                   TO LN-RETURN-CODE
                 MOVE 'NEGATIVE_BALANCE'     TO LN-ERROR-CODE
              WHEN LN-DAYS-PAST-DUE > WS-MAX-DAYS
                 MOVE '08'                   TO LN-RETURN-CODE
                 MOVE 'INVALID_DAYS_PAST_DUE' TO LN-ERROR-CODE
           END-EVALUATE.
      *----------------------------------------------------------------*
      * 2000-CALC-FEE : 5% OF BALANCE, ROUNDED HALF-UP, CAP 25.00      *
      *                 ONLY AFTER THE 15-DAY GRACE PERIOD             *
      *----------------------------------------------------------------*
       2000-CALC-FEE.
           IF LN-DAYS-PAST-DUE > WS-GRACE-DAYS
              COMPUTE WS-RAW-FEE ROUNDED =
                      LN-OUTSTANDING-BAL * WS-FEE-RATE
              IF WS-RAW-FEE > WS-FEE-CAP
                 MOVE WS-FEE-CAP         TO LN-LATE-FEE
              ELSE
                 MOVE WS-RAW-FEE         TO LN-LATE-FEE
              END-IF
              IF LN-LATE-FEE > ZERO
                 MOVE 'Y'                TO LN-FEE-ASSESSED
              END-IF
           END-IF.
      *----------------------------------------------------------------*
      * 3000-ADVANCE-STATUS : STATUS ONLY ESCALATES, NEVER DOWNGRADES  *
      *   RANK 0 = CURRENT, 1 = DELINQUENT (>=30), 2 = CHARGEOFF (>=90)*
      *----------------------------------------------------------------*
       3000-ADVANCE-STATUS.
           EVALUATE TRUE
              WHEN LN-DAYS-PAST-DUE >= WS-CHARGEOFF-DAYS
                 MOVE 2 TO WS-NEW-RANK
              WHEN LN-DAYS-PAST-DUE >= WS-DELINQ-DAYS
                 MOVE 1 TO WS-NEW-RANK
              WHEN OTHER
                 MOVE 0 TO WS-NEW-RANK
           END-EVALUATE
           EVALUATE TRUE
              WHEN LN-STATUS-CHARGEOFF
                 MOVE 2 TO WS-CUR-RANK
              WHEN LN-STATUS-DELINQUENT
                 MOVE 1 TO WS-CUR-RANK
              WHEN OTHER
                 MOVE 0 TO WS-CUR-RANK
           END-EVALUATE
           IF WS-NEW-RANK > WS-CUR-RANK
              EVALUATE WS-NEW-RANK
                 WHEN 2
                    MOVE 'CHARGEOFF'     TO LN-NEW-STATUS
                 WHEN 1
                    MOVE 'DELINQUENT'    TO LN-NEW-STATUS
              END-EVALUATE
           END-IF.
