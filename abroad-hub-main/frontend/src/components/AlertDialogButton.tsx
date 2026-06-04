"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { warmFlightResponse } from "next/dist/server/app-render/app-render";

export interface AlertDialogProps {
  triggerElement: React.ReactNode;
  warningDescription: string;
  clickAction: React.MouseEventHandler<HTMLButtonElement>;
}

export function AlertDialogButton({
  alertDialogProps,
}: {
  alertDialogProps: AlertDialogProps;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {alertDialogProps.triggerElement}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          <strong
            dangerouslySetInnerHTML={{
              __html: alertDialogProps.warningDescription,
            }}
          />
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={alertDialogProps.clickAction}>
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
