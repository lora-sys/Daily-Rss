export default function Card({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}
