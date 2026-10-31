import { FiGithub } from "react-icons/fi";
import { GITHUB_URL } from "./constants";

const SiteFooter = () => (
  <footer className="border-t border-white/10">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Designed and built by <span className="text-slate-200">Bharat Garsondiya</span>
      </p>
      <div className="flex items-center gap-5">
        <a
          href="https://opendata.cityofnewyork.us/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          Data: NYC Open Data
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-white"
        >
          <FiGithub aria-hidden /> Source
        </a>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
