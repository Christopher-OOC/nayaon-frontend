"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BellRing, Check, LoaderCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type EventItem = {
  id: number;
  message: string;
  type: string;
  acknowledged: boolean;
  eventDate: string;
};

const endpoint = process.env.NEXT_PUBLIC_EVENTS_ENDPOINT || "/api/v1/events";

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parseEvents(payload: unknown): EventItem[] {
  if (!Array.isArray(payload)) {
    throw new Error("The events response did not contain an event list.");
  }
  return payload as EventItem[];
}

function formatEventDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const loadEvents = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedFetch(`${endpoint}/unacknowledged`, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getMessage(payload, "Could not load unacknowledged events."));
      }
      setEvents(parseEvents(payload));
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load unacknowledged events.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadEvents(controller.signal);
    return () => controller.abort();
  }, [loadEvents]);

  const acknowledgeEvent = async (eventId: number) => {
    setAcknowledgingId(eventId);
    setError("");
    setNotice("");
    try {
      const response = await authenticatedFetch(
        `${endpoint}/${eventId}/acknowledge`,
        { method: "PUT" },
      );
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        throw new Error(getMessage(payload, "Could not acknowledge this event."));
      }
      setEvents((current) => current.filter((event) => event.id !== eventId));
      setNotice("Event acknowledged.");
    } catch (acknowledgeError) {
      setError(acknowledgeError instanceof Error ? acknowledgeError.message : "Could not acknowledge this event.");
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin / Events</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Events</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review and acknowledge pending system events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{events.length} unacknowledged</Badge>
          <Button type="button" variant="outline" size="icon" onClick={() => void loadEvents()} disabled={loading} aria-label="Refresh events" title="Refresh events">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="w-36">Type</TableHead>
                  <TableHead className="w-56">Date</TableHead>
                  <TableHead className="w-36 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-36 text-center text-muted-foreground">
                      <LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading events
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <BellRing className="size-5" />
                        <span>No unacknowledged events.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="min-w-64 whitespace-normal font-medium">{event.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.type}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatEventDate(event.eventDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void acknowledgeEvent(event.id)}
                        disabled={acknowledgingId !== null}
                      >
                        {acknowledgingId === event.id ? <LoaderCircle className="animate-spin" /> : <Check />}
                        Acknowledge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}