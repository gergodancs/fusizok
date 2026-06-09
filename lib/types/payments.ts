export type ShareContactOutcome =
  | "activated"
  | "craftsman_payment_required"
  | "already_active";

export type ShareContactResult =
  | {
      ok: true;
      outcome: ShareContactOutcome;
      conversationId: string;
      craftsmanId: string;
      jobId: string;
      usedCredit?: boolean;
    }
  | {
      ok: false;
      error: string;
    };

export type ContactActivationPollResult =
  | {
      ok: true;
      contactShared: true;
      conversationId: string;
    }
  | {
      ok: true;
      contactShared: false;
      status: string;
    }
  | {
      ok: false;
      error: string;
    };

export type CreateCheckoutSessionResult =
  | {
      ok: true;
      clientSecret: string;
      sessionId: string;
    }
  | {
      ok: false;
      error: string;
    };
