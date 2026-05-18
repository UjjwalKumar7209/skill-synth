export default function Hero() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 lg:m-0 mt-10 lg:min-h-screen mb-10 lg:px-0 px-4">
      <h2 className="lg:text-6xl text-4xl font-extrabold lg:w-2/3 text-center">
        Master the interview with AI precision.
      </h2>
      <p className="lg:w-1/2 text-center">
        SkillSynth simulates realistic technical and behavioral interviews
        tailored to top-tier companies. Get instant feedback and improve faster.
      </p>
      <div className='flex lg:gap-10 gap-2 mt-10 text-gray-500 font-bold'>
        <span>GOOGLE</span>
        <span>AMAZON</span>
        <span>MICROSOFT</span>
        <span>ATLASSIAN</span>
      </div>
    </div>
  )
}
