import { useNavigate } from "react-router";
import { FiMap, FiList, FiBarChart2, FiNavigation } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { PITCH } from "./data";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-indigo-100/60 via-white to-cyan-100/30" />
        <Section className="pt-28 pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              NYC 311 Data Viewer
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl dark:text-black">
              Explore{" "}
              <span className="bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                311 complaint patterns
              </span>{" "}
              across your city
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
              Explore an interactive dashboard of 311 service requests. Spot trends in complaint
              types, track resolution times, and see which areas need the most attention.
            </p>

            <div className="mt-10 flex justify-center">
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Explore the Dashboard
              </Button>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Product Pitch">
        <div className="flex flex-col gap-4 max-w-5xl">
          {PITCH.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>
      </Section>

      <Section title="Why use our service?">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            icon={<FiMap />}
            title="Interactive Geographic Map"
            description="Easily spot high demand areas and trends between neighbourhoods."
          />
          <Card
            icon={<FiList />}
            title="Category-Based Filtering"
            description="Filter by specific complaint types to only see the data that matters to you."
          />
          <Card
            icon={<FiNavigation />}
            title="Location-level Comparison"
            description="Effortlessly compare complaint volume across boroughs and zip codes."
          />
          <Card
            icon={<FiBarChart2 />}
            title="Accessible Visualization"
            description="View the entire 311 dataset in one place, no technical expertise required."
          />
        </div>
      </Section>
    </div>
  );
}
