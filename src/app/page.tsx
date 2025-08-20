export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Banner */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg mb-8">
        <img
          src="/banner.jpg"
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title & Description */}
      <div className="max-w-2xl text-center my-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Ready for life</h1>
        <p className="text-lg text-gray-700">
            Χτίσε το μέλλον που ονειρεύεσαι. 
        </p>
        <p className="text-lg text-gray-700">
            Eφοδιάζοντας τους νέους με ικανότητες και αξίες για να καθορίσουν την ζωή τους
        </p>
      </div>

      {/* Map */}
      <div className="w-full flex justify-center mb-12">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3466.034160767434!2d22.87582007649449!3d40.99866087135193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a9c56d25fae8ef%3A0xbe7f046eab1f53b6!2zMs6_IM6jz43Pg8-EzrfOvM6xIM6gz4HOv8-DzrrPjM-Az4nOvSDOms65zrvOus6vz4I!5e1!3m2!1sel!2sgr!4v1755596119756!5m2!1sel!2sgr"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
