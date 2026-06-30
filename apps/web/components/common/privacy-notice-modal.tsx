"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

interface PrivacyNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyNoticeModal({ open, onOpenChange }: PrivacyNoticeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Notice — Klasee LMS</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Data We Collect</h3>
            <p>
              Klasee collects your full name, email address, phone number (optional), role
              (student or instructor), and academic information such as year level, program,
              and guardian details for students. We also collect course activity data including
              grades, attendance records, quiz attempts, and assignment submissions.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Purpose of Collection</h3>
            <p>
              Your data is collected and processed solely to operate the Klasee classroom
              management system — enrolling students in courses, tracking grades and
              attendance, facilitating assessments, and enabling communication between
              instructors and students within your institution.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Who Sees Your Data</h3>
            <p>
              Your instructors may view your grades, attendance records, and submitted work.
              Your school or institution administrators may access enrollment and academic
              performance data. Klasee system administrators access data only as necessary
              for platform operation and support.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Your Rights</h3>
            <p>
              Under the Data Privacy Act of 2012 (Republic Act No. 10173) and applicable
              data protection laws, you have the right to access, correct, and request
              deletion of your personal data at any time. You may delete your account and
              all associated personal data from your account settings.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Data Retention</h3>
            <p>
              Your personal data is retained for the duration of your enrollment or
              employment with your institution. When you delete your account, your personal
              information is permanently removed from our systems. Academic records tied to
              course content (such as course structure and anonymized grades) may be
              retained to preserve institutional records.
            </p>
          </section>

          <p className="text-xs pt-2 border-t border-border">
            For questions about your data or to exercise your rights, contact your institution&apos;s
            data privacy officer or reach out to Klasee support.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
