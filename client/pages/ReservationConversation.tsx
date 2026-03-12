import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchReservations } from "@/store/slices/reservationsSlice";
import {
  ArrowLeft,
  MessageSquareText,
  Send,
  Calendar,
  Ship,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

const ReservationConversation = () => {
  const { reservationId } = useParams();
  const dispatch = useAppDispatch();
  const { reservations, isLoading } = useAppSelector(
    (state) => state.reservations,
  );
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (reservations.length === 0) {
      dispatch(fetchReservations(undefined));
    }
  }, [dispatch, reservations.length]);

  const reservation = useMemo(() => {
    const id = Number(reservationId);
    if (!Number.isInteger(id)) return null;
    return reservations.find((r) => r.id === id) || null;
  }, [reservationId, reservations]);

  const sampleMessages = useMemo(
    () => [
      {
        id: "m1",
        role: "host",
        text: "Welcome to the conversation space. Soon you will be able to message the marina team here before arrival.",
        time: "Today, 09:20",
      },
      {
        id: "m2",
        role: "system",
        text: "Conversation tools are in preview mode. Messaging API integration is the next step.",
        time: "Today, 09:21",
      },
    ],
    [],
  );

  return (
    <Layout>
      <MetaHelmet
        title="Reservation Conversation - DockNow"
        description="Conversation workspace for reservation coordination with marina staff."
        keywords="docknow conversation, reservation communication, marina messaging"
        url={typeof window !== "undefined" ? window.location.href : ""}
        type="website"
        noindex={true}
      />

      <div className="min-h-screen bg-navy-50/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/reservations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-ocean-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to reservations
            </Link>
            <Badge className="bg-ocean-100 text-ocean-800 border-ocean-200 uppercase tracking-wider text-[11px] font-bold">
              Conversation Workspace
            </Badge>
          </div>

          {isLoading && !reservation ? (
            <Card className="border-none shadow-sm">
              <CardContent className="py-12 text-center text-navy-500">
                Loading reservation context...
              </CardContent>
            </Card>
          ) : !reservation ? (
            <Card className="border-none shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-xl font-bold text-navy-900 mb-2">
                  Reservation not found
                </p>
                <p className="text-navy-500 mb-6">
                  This conversation cannot be opened right now.
                </p>
                <Link to="/reservations">
                  <Button className="bg-gradient-ocean text-white">
                    Return to dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg text-navy-900">
                    Reservation Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-navy-400 uppercase tracking-wider font-bold">
                      Marina
                    </p>
                    <p className="text-navy-900 font-semibold mt-1">
                      {reservation.marina.name}
                    </p>
                    <p className="text-navy-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {reservation.marina.city}, {reservation.marina.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase tracking-wider font-bold">
                      Boat
                    </p>
                    <p className="text-navy-900 font-semibold mt-1 flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5" />
                      {reservation.boat.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase tracking-wider font-bold">
                      Check-in
                    </p>
                    <p className="text-navy-900 font-semibold mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(reservation.checkInDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 uppercase tracking-wider font-bold">
                      Duration
                    </p>
                    <p className="text-navy-900 font-semibold mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {reservation.totalDays}{" "}
                      {reservation.totalDays === 1 ? "night" : "nights"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm lg:col-span-2 flex flex-col min-h-[560px]">
                <CardHeader className="border-b border-navy-100">
                  <CardTitle className="text-lg text-navy-900 flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5 text-ocean-600" />
                    Marina Conversation
                  </CardTitle>
                  <p className="text-sm text-navy-500">
                    Modern messaging workspace scaffold. Real-time and host-side
                    inbox integration comes next.
                  </p>
                </CardHeader>

                <CardContent className="flex-1 p-6 flex flex-col">
                  <div className="space-y-3 flex-1 overflow-auto pr-1">
                    {sampleMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-2xl px-4 py-3 max-w-[86%] ${
                          msg.role === "host"
                            ? "bg-white border border-navy-100"
                            : "bg-ocean-50 border border-ocean-100 text-ocean-900"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-[11px] text-navy-400 mt-2">
                          {msg.time}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-dashed border-navy-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type your message draft..."
                        className="min-h-[90px] w-full resize-none rounded-xl border border-navy-100 p-3 text-sm outline-none focus:ring-2 focus:ring-ocean-500"
                      />
                      <Button
                        disabled
                        className="h-10 px-4 bg-gradient-ocean text-white inline-flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-navy-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sending will be enabled after conversation API and
                      notification events are connected.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReservationConversation;
