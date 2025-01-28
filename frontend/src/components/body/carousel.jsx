// MeetingRooms.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

function MeetingRooms({ title, imgSrc, onReserve }) {
  return (
    <div className="p-5 md:p-5 lg:w-1/3 md:w-1/2 w-full">
      <Card className="w-full shadow-lg">
        <CardHeader floated={false} color="blue-gray">
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-48 md:h-56 object-cover"
          />
          <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-tr from-transparent via-transparent to-black/60" />
        </CardHeader>
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <Typography
              variant="h5"
              color="blue-gray"
              className="font-medium text-base md:text-lg"
            >
              {title}
            </Typography>
          </div>
        </CardBody>
        <CardFooter className="pt-3">
          <Button
            size="lg"
            fullWidth={true}
            className="text-sm md:text-lg"
            onClick={() => onReserve(title)} // Call the onReserve function with the room title
          >
            Reserve
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default MeetingRooms;
