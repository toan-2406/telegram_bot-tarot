import { useLoading } from "../../contexts/loading.context";

const LoadingScreen = () => {
  const { loading } = useLoading();
  return loading ? (
    <div className="flex items-center justify-center w-full h-full bg-gray-800 fixed top-0 left-0 z-[1002]">
      <div className="loader border-t-4 border-b-4 border-yellow-500 rounded-full w-16 h-16 animate-spin"></div>
    </div>
  ) : null;
};

export default LoadingScreen;
