import type { CardProps } from "@/types/Card";

/**
 * Textbox with a title and icon
 * @param icon - Icon to display
 * @param title - Title of card
 * @param description - Description of card
 */
export default function Card({ icon, title, description }: CardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-indigo-200">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-100 to-cyan-50 text-indigo-600 text-2xl">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold dark:text-black">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
