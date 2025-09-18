import OperationsSection from "../sections/OperationsSection";

function MainView() {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <div>session data: shift, recette actuelle, sort...</div>
      <OperationsSection />
    </div>
  );
}
export default MainView;
