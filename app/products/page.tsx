/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/react-in-jsx-scope */
import { Balancer } from "react-wrap-balancer"
import { cn } from "@/lib/utils"
// import Link from "next/link"
import Image from 'next/image'

import {
    Card,
    CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
//   import { Car, FileTextIcon } from "lucide-react"
//   import {
//     Table,
//     TableBody,
//     TableCaption,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
//   } from "@/components/ui/table"
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink } from "lucide-react"


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between pl-8 pr-8 pt-4 md:pl-24 md:pr-24 md:pt-12">
    <div className="space-y-2">
        <h1 className={cn("scroll-m-20 text-3xl pb-3 md:pb-6 font-bold tracking-tight")}>Products</h1>
        <Card className="mb-2 mt-2 md:mb-4 md:mt-4">
            <CardHeader>
                <CardTitle>20W Dummy Load Kit (BNC)
                    <div className="block md:inline">
                        <Button asChild variant="default" className="mt-4 md:mt-0 md:ml-8">
                            <Link target="_blank" href="https://ca0f39-2e.myshopify.com/products/20w-dummy-load-kit?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web"> 
                                <ExternalLink className="mr-2 h-4 w-4" /> Buy Now
                            </Link>
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-2 md:mb-4">
                    <Balancer>
                        Unleash the full potential of your ham radio setup with our 20W Dummy Load Kit, designed for 
                        both novice and experienced operators. Whether you’re testing, adjusting, or simply 
                        experimenting with your equipment, this kit provides the perfect solution for ensuring your 
                        transmitter is optimally configured without transmitting signals on the air. The kit is shipped 
                        unassembled and without an enclosure.
                    </Balancer>

                </CardDescription>
                
                <Carousel orientation="horizontal" className="m-4 md:m-8"
                opts={{
                    align: "start",
                    loop: true,
                }} 
                >
                    <CarouselPrevious/>
                    <CarouselContent>
                        <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                            <Image src="/images/dl20w_bnc/FinishedBoard.png" width={350} height={350} alt="20W Dummy Load (BNC)" />
                        </CarouselItem>
                        <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                            <Image src="/images/dl20w_bnc/KitComponents.jpg" width={350} height={350} alt="20W Dummy Load (BNC)" />

                        </CarouselItem>
                        <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                            <Image src="/images/dl20w_bnc/PowerProbe.jpg" width={350} height={350} alt="20W Dummy Load (BNC)" />
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselNext/>
                </Carousel>
            
                <h2 className={cn("text-2xl pb-2 font-bold tracking-tight")}>
                    Key Features
                </h2>
                <Balancer>
                    <ul className="ml-8 list-disc">
                        <li><b>High-Quality Components:</b> Each kit includes precision resistors and robust, heat-resistant materials designed to withstand continuous usage at 20 watts.</li>
                        <li><b>Easy Assembly:</b> With clear, step-by-step instructions, you can assemble your dummy load in no time. No advanced tools required—just a soldering iron and some basic electronics skills.</li>
                        <li><b>Integrated Power Measurement:</b> Equipped with on-board measurement components, this kit allows for accurate measurement of power output via test pads with a multimeter (not included), ensuring your equipment operates at its best.</li>
                        <li><b>Compact and Efficient:</b> The sleek, compact design makes it easy to integrate into any ham radio setup without taking up unnecessary space.</li>
                        <li><b>Versatile Use: Perfect</b> for testing the output power of your transmitters, tuning antennas, or adjusting signal amplifiers without interference.</li>
                        <li><b>Educational Experience:</b> Not only is this a practical tool for your radio activities, but it’s also a great project for learning more about the fundamentals of radio electronics and antenna theory.</li>
                    </ul>
                </Balancer>

                <h2 className={cn("scroll-m-20 text-2xl pt-3 md:pt-6 pb-2 font-bold tracking-tight")}>
                    Specifications
                </h2>
                <ul className="ml-8 list-disc">
                    <li><b>Power Handling:</b> 20W continuous, 100W peak (momentary)</li>
                    <li><b>Impedance:</b> 50 ohms</li>
                    <li><b>Dimensions:</b> 4.5" x 2" x 0.75" (12cm x 5cm x 2cm)</li>
                    <li><b>Frequency Range:</b> 0-455 MHz</li>
                    <li><b>SWR:</b></li>
                    <ul className="ml-8 list-disc">
                        
                        <li>&lt;1.1 for HF bands (160m - 10m)</li>
                        <li>&lt;1.5 for 6m band</li>
                        <li>&lt;2.5 for 2m band</li>
                        <li>&lt;1.3 for 70cm band</li>
                    </ul>
                </ul>

                <div>
                    <Button asChild variant="default" className="mt-8 ml-4">
                        <Link target="_blank" href="https://ca0f39-2e.myshopify.com/products/20w-dummy-load-kit?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web"> 
                            <ExternalLink className="mr-2 h-4 w-4" /> Buy Now
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
    </main>
  );
}
