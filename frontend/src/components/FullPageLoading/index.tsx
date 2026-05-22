import { OrbitProgress } from "react-loading-indicators";

export default function FullPageLoading() {
  return (
    <div
      className="loading-div"
      style={{ alignContent: "center", alignItems: "center", width: "100%" }}
    >
      <OrbitProgress size="large" color="#072e0d" />
    </div>
  );
}
