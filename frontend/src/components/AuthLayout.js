export default function AuthLayout({ title, children }) {

  return (

    <div className="min-h-screen w-full flex flex-col lg:flex-row">

      {/* LEFT SIDE */}
      <div className="
        hidden lg:flex 
        w-1/2 
        min-h-screen 
        items-center 
        justify-center
        bg-gradient-to-br 
        from-[#84B179] 
        to-[#A2CB8B]
        relative
        overflow-hidden
      ">

        {/* decorative glow */}
        <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
          alt="Students"
          className="relative w-[380px] drop-shadow-2xl"
        />

      </div>


      {/* RIGHT SIDE */}
      <div className="
        w-full 
        lg:w-1/2 
        min-h-screen 
        flex 
        items-center 
        justify-center
        bg-gradient-to-br 
        from-[#E8F5BD] 
        via-[#C7EABB] 
        to-[#A2CB8B]
        p-6
      ">

        <div className="
          w-full 
          max-w-md 
          bg-white/90 
          backdrop-blur-lg 
          shadow-2xl 
          rounded-2xl 
          p-10
        ">

          <h2 className="
            text-3xl 
            font-bold 
            text-center 
            text-[#84B179] 
            mb-8
          ">
            {title}
          </h2>

          {children}

        </div>

      </div>

    </div>

  )

}