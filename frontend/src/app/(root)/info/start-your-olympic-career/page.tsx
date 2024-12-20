import SideBar from '@/components/SideBar'
import React from 'react'

function StartYourOlympicCareerPage() {
    return (
        <div className="h-full bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex">
            <SideBar />

            <div className="flex flex-col w-4/5 p-5 text-white">
                <h1 className='text-accent mt-4 mb-10 text-4xl font-bold'>
                    Start Your Olympic Career
                </h1>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <p>Applying to participate in the Olympic Games is a complex and lengthy process that requires dedication, top-level results, and adherence to strict rules. This text outlines the steps an athlete must take, the required documentation, training standards, and the percentage of athletes who actually reach the Olympic level.</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        1. Meeting Sporting Standards and Qualifications
                    </h1>

                    <p>Each discipline in the Olympic Games has strictly defined qualification standards that athletes must meet. These standards are set by international sports federations governing specific sports and include:</p>
                    
                    <ul
                        className='text-left mt-3 mb-3'
                    >
                        <li><strong>Performance Standards:</strong> Athletes must achieve minimum results, such as specific times in running, heights in jumping, or scores in gymnastics, at competitions recognized by international sports organizations.</li>
                        <li><strong>Qualification Tournaments:</strong> In many sports, such as boxing, tennis, or team sports, athletes must pass through qualification tournaments at regional, continental, or world levels.</li>
                        <li><strong>World Ranking:</strong> In sports like tennis or golf, the international federation’s rankings determine which players qualify for the Olympic Games.</li>
                    </ul>

                    <p>For instance, in athletics, there are "A" and "B" standards. Athletes who meet the "A" standard automatically qualify, while those with the "B" standard depend on quotas and additional conditions.</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        2. Affiliation with a National Olympic Committee (NOC)
                    </h1>

                    <p>Athletes can apply to the Olympic Games exclusively through their National Olympic Committee (NOC). This means that:</p>
                    
                    <ul
                        className='text-left mt-3 mb-3'
                    >
                        <li>The athlete must be a citizen of the country they represent.</li>
                        <li>They must have the support of the national sports organization overseeing their sport.</li>
                        <li>The athlete must be registered with the international federation for their sport.</li>
                    </ul>

                    <p>National Olympic Committees play a crucial role in the application process as they coordinate national qualifications, select teams, and compile the necessary documentation for the International Olympic Committee (IOC).</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        3. Ethical and Health Requirements
                    </h1>

                    <h1 className='text-accent text-xl font-semibold'>
                        Anti-Doping Rules
                    </h1>
                    
                    <p>Every athlete aiming to compete in the Olympic Games must comply with anti-doping rules. This includes:</p>
                    
                    <ul
                        className='text-left mt-3 mb-3'
                    >
                        <li>Regular doping tests, both in and out of competition.</li>
                        <li>Reporting their whereabouts through the "whereabouts" system to allow doping control officers to conduct tests at any time.</li>
                    </ul>
                    
                    <h1 className='text-accent text-xl font-semibold'>
                        Medical Documentation
                    </h1>
                    
                    <p>Athletes must undergo health screenings to ensure they are fit to compete. In some sports (e.g., combat sports), additional checks are required to ensure athlete safety.</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        4. Required Documentation
                    </h1>
                    
                    <p>Athletes and their teams must submit extensive documentation during the application process. This includes:</p>
                    
                    <ul
                        className='text-left mt-3 mb-3'
                    >
                        <li><strong>Personal Documents:</strong> Passport and proof of citizenship.</li>
                        <li><strong>Sporting Results:</strong> Certificates proving the fulfillment of qualification standards or results from international competitions.</li>
                        <li><strong>Medical Certificates:</strong> Health screenings and fitness confirmations.</li>
                        <li><strong>Anti-Doping Certificates:</strong> Evidence of compliance with anti-doping rules.</li>
                    </ul>
                    
                    <p>Additionally, National Olympic Committees must ensure the proper registration of teams with the IOC, including technical details such as uniforms, logistics, and security measures.</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        5. Training for Peak Performance
                    </h1>
                    
                    <h1 className='text-accent text-xl font-semibold'>
                        Physical Preparation
                    </h1>
                    
                    <ul
                        className='text-left mt-3 mb-3'
                    >
                        <li><strong>Periodization:</strong> Training is planned over phases that include base preparation, competition-specific training, and tapering (reducing intensity before competition).</li>
                        <li><strong>Multidisciplinary Approach:</strong> This includes working with coaches, physiotherapists, nutritionists, and sports psychologists.</li>
                        <li><strong>Competition Simulation:</strong> Training under conditions that mimic real competitive circumstances, such as altitude training or using similar equipment.</li>
                    </ul>
                    
                    <h1 className='text-accent text-xl font-semibold'>
                        Mental Preparation
                    </h1>
                    
                    <p>Mental strength is as important as physical readiness. Athletes use techniques like visualization, meditation, and stress management to stay focused.</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        6. Percentage of Athletes Reaching Olympic Level
                    </h1>
                    
                    <p>Becoming an Olympian is an exceptionally rare achievement. According to estimates:</p>
                    
                    <ul
                        className='text-left mt-3 mb-3'
                    >
                        <li>Less than 0.1% of athletes worldwide reach the level required to qualify for the Olympic Games.</li>
                        <li>Only the best in their country and those who meet international standards have the opportunity to compete.</li>
                    </ul>
                    
                    <p>In some sports, competition is particularly fierce. For example, in athletics or swimming, differences in results can be measured in fractions of a second, while team sports require synergy across the entire team.</p>
                </section>

                <section
                    className='mb-5 text-center flex flex-col items-center justify-center'
                >
                    <h1
                        className='mt-4 mb-10 text-2xl font-bold'
                    >
                        Conclusion
                    </h1>
                    
                    <p>Applying for the Olympic Games is not just about talent but also the result of years of dedicated work, top results, and adherence to strict rules. Athletes must go through a complex qualification process, meet physical and health requirements, and face the challenges of global competition. Only the most persistent and prepared manage to fulfill their dream of competing on the world’s biggest sporting stage.</p>
                </section>
            </div>
        </div>
    )
}

export default StartYourOlympicCareerPage
