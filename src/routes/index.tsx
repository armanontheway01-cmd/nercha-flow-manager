import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { Ambient, Panel, Pill } from "@/components/nercha/ui";
import { StatusBand } from "@/components/nercha/StatusBand";
import { getPublicHome } from "@/lib/nercha.functions";
import galleryOne from "@/assets/nercha-serving.jpg";
import galleryTwo from "@/assets/nercha-kitchen.jpg";
import galleryThree from "@/assets/nercha-volunteers.jpg";

const homeQuery = queryOptions({
  queryKey: ["public-home"],
  queryFn: () => getPublicHome(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "Mamburam Aandu Nercha — food distribution status" },
      {
        name: "description",
        content:
          "Live food distribution status, duty list and photos from the Mamburam Aandu Nercha, managed by Darul Huda Islamic University.",
      },
      { property: "og:title", content: "Mamburam Aandu Nercha — food distribution status" },
      {
        property: "og:description",
        content: "Live distribution status, duties and gallery from Mamburam Aandu Nercha.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center bg-paper text-ink">
      <p className="text-sm text-moss">The status could not be loaded. Please refresh.</p>
    </div>
  ),
  component: PublicHome,
});

const fallbackGallery = [
  { url: galleryOne, caption: "Packets handed over at the main counter" },
  { url: galleryTwo, caption: "Kitchen team preparing the day's rice" },
  { url: galleryThree, caption: "Student volunteers guiding the queue" },
];

function PublicHome() {
  const { data } = useSuspenseQuery(homeQuery);
  const status = data.status;
  const images = data.gallery.length
    ? data.gallery.map((g) => ({ url: g.url, caption: g.caption ?? "" }))
    : fallbackGallery;

  return (
    <div className="min-h-screen w-full bg-paper text-ink font-sans antialiased relative overflow-x-hidden">
      <Ambient />
      <div className="relative">
        <StatusBand
          ongoing={status?.is_ongoing ?? false}
          headline={status?.headline ?? "Mamburam Aandu Nercha"}
          subline={status?.subline ?? "Darul Huda Islamic University"}
          packets={status?.packets_issued ?? 0}
          tokens={data.activeTokens}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl leading-tight text-balance max-w-[24ch]">
              Aandu Nercha food distribution
            </h1>
            <p className="mt-2 text-sm text-moss/80 text-pretty max-w-[56ch]">
              Run by the teachers and students of Darul Huda Islamic University. Duties, volunteers and
              donation tokens are managed by the head teacher's office.
            </p>
            {status?.notice && (
              <p className="mt-3 text-sm font-medium text-clay">{status.notice}</p>
            )}
          </div>
          <Link
            to="/login"
            className="text-sm font-semibold px-4 py-2 rounded-md bg-forest text-cream hover:bg-forest-deep"
          >
            Volunteer &amp; staff sign in
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Duties running", value: data.duties.length },
            { label: "Volunteers", value: data.volunteers },
            { label: "Present today", value: data.present },
            { label: "Volunteers on duty", value: data.assigned },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[14px] bg-glass/55 backdrop-blur-xl ring-1 ring-black/5 shadow-lg p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-moss/70">{stat.label}</p>
              <p className="font-display text-3xl text-forest leading-none mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel title="Today's duties" subtitle="Assigned and managed by the head teacher" className="lg:col-span-1">
            <ul className="divide-y divide-black/5">
              {data.duties.map((duty) => (
                <li key={duty.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{duty.name}</span>
                    {(duty.start_time || duty.end_time) && (
                      <Pill tone="forest">
                        {duty.start_time ?? "—"} – {duty.end_time ?? "—"}
                      </Pill>
                    )}
                  </div>
                  {duty.location && <p className="text-xs text-moss/70 mt-1">{duty.location}</p>}
                </li>
              ))}
              {!data.duties.length && (
                <li className="px-4 py-6 text-sm text-moss/70">Duties will appear here soon.</li>
              )}
            </ul>
          </Panel>

          <Panel title="Gallery" subtitle="Moments from the Nercha" className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
              {images.map((image) => (
                <figure key={image.url} className="overflow-hidden rounded-[10px] ring-1 ring-black/5">
                  <img
                    src={image.url}
                    alt={image.caption || "Aandu Nercha food distribution"}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                  {image.caption && (
                    <figcaption className="px-2.5 py-2 text-[11px] text-moss/80 bg-cream/70">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
