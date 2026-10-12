      *================================================================*
      * COPYBOOK  : LNFEEREC                                           *
      * PURPOSE   : LATE-FEE REQUEST AND RESPONSE LAYOUTS PASSED TO    *
      *             LNFEE010 BY THE NIGHTLY SERVICING BATCH (LNBATCH). *
      *================================================================*
       01  LN-FEE-REQUEST.
           05  LN-ACCOUNT-ID              PIC X(12).
           05  LN-OUTSTANDING-BAL         PIC S9(9)V99 COMP-3.
           05  LN-DAYS-PAST-DUE           PIC 9(4).
           05  LN-ACCT-STATUS             PIC X(10).
               88  LN-STATUS-CURRENT      VALUE 'CURRENT'.
               88  LN-STATUS-DELINQUENT   VALUE 'DELINQUENT'.
               88  LN-STATUS-CHARGEOFF    VALUE 'CHARGEOFF'.
               88  LN-STATUS-CLOSED       VALUE 'CLOSED'.
               88  LN-STATUS-VALID        VALUE 'CURRENT'
                                                'DELINQUENT'
                                                'CHARGEOFF'
                                                'CLOSED'.
       01  LN-FEE-RESPONSE.
           05  LN-RETURN-CODE             PIC X(2).
           05  LN-ERROR-CODE              PIC X(24).
           05  LN-LATE-FEE                PIC S9(5)V99 COMP-3.
           05  LN-FEE-ASSESSED            PIC X(1).
           05  LN-NEW-STATUS              PIC X(10).
