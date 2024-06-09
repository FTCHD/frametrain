export const SUBGRAPH_URL =
  "https://api.studio.thegraph.com/query/30735/calcast/version/latest";

export const CONTRACT_ADDRESS = "0x51d51C87e7f55547D202FCdBb5713bF9d4a5f6A4";

export const ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "uint256", name: "bookingId", type: "uint256" }],
    name: "BookingDoesNotExist",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "farcasterId", type: "uint256" },
      { internalType: "uint256", name: "timeSlot", type: "uint256" },
      { internalType: "uint256", name: "bookingFee", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "InsufficientBookingFee",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "farcasterId", type: "uint256" }],
    name: "ProfileAlreadyExists",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "farcasterId", type: "uint256" }],
    name: "ProfileDoesNotExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "profileFarcasterId",
        type: "uint256",
      },
      { internalType: "uint256", name: "timeStart", type: "uint256" },
      { internalType: "uint256", name: "timePeriod", type: "uint256" },
    ],
    name: "SlotAlreadyBooked",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "farcasterId", type: "uint256" },
      { internalType: "uint256", name: "timePeriod", type: "uint256" },
    ],
    name: "TimePeriodDoesNotExist",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "farcasterId", type: "uint256" },
      { internalType: "uint256", name: "timeSlot", type: "uint256" },
    ],
    name: "TimeSlotDoesNotExist",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "farcasterId", type: "uint256" },
      { internalType: "uint256", name: "timeSlot", type: "uint256" },
      { internalType: "uint256", name: "timePeriod", type: "uint256" },
    ],
    name: "TimeSlotInvalid",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "farcasterId", type: "uint256" },
      { internalType: "uint256", name: "timeSlot", type: "uint256" },
    ],
    name: "TimeSlotUnavailable",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bookingPeriodLimit",
        type: "uint256",
      },
    ],
    name: "BookingPeriodLimitUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bookingId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bookerFarcasterId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "profileFarcasterId",
        type: "uint256",
      },
      { indexed: false, internalType: "uint8", name: "day", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "month", type: "uint8" },
      {
        indexed: false,
        internalType: "uint16",
        name: "year",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeStartInSeconds",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timePeriodInSeconds",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "CallBooked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bookingId",
        type: "uint256",
      },
    ],
    name: "CallCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "farcasterId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "timeSlots",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "timePeriods",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "pricing",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "string",
        name: "profileMetadata",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "karmaGatingEnabled",
        type: "bool",
      },
    ],
    name: "ProfileCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "farcasterId",
        type: "uint256",
      },
    ],
    name: "ProfileDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "farcasterId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "timeSlots",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "timePeriods",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "pricing",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "string",
        name: "profileMetadata",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "karmaGatingEnabled",
        type: "bool",
      },
    ],
    name: "ProfileUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "_bookingCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_profileCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_senderFarcasterId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_profileFarcasterId",
        type: "uint256",
      },
      { internalType: "uint256", name: "_timeSlotId", type: "uint256" },
      { internalType: "uint256", name: "_timePeriodId", type: "uint256" },
      { internalType: "uint8", name: "_day", type: "uint8" },
      { internalType: "uint8", name: "_month", type: "uint8" },
      { internalType: "uint16", name: "_year", type: "uint16" },
    ],
    name: "bookCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
    ],
    name: "bookingCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bookingPeriodLimit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "bytes32", name: "", type: "bytes32" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "bookingTimeCheck",
    outputs: [
      { internalType: "uint256", name: "timeStart", type: "uint256" },
      { internalType: "uint256", name: "timePeriod", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "bookings",
    outputs: [
      { internalType: "uint256", name: "bookingId", type: "uint256" },
      { internalType: "uint256", name: "bookerFarcasterId", type: "uint256" },
      {
        internalType: "uint256",
        name: "profileFarcasterId",
        type: "uint256",
      },
      { internalType: "uint256", name: "timeStart", type: "uint256" },
      { internalType: "uint256", name: "timePeriod", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint8", name: "day", type: "uint8" },
      { internalType: "uint8", name: "month", type: "uint8" },
      { internalType: "uint16", name: "year", type: "uint16" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_profileFarcasterId",
        type: "uint256",
      },
      { internalType: "uint256", name: "_timeSlot", type: "uint256" },
      { internalType: "uint8", name: "_day", type: "uint8" },
      { internalType: "uint8", name: "_month", type: "uint8" },
      { internalType: "uint16", name: "_year", type: "uint16" },
    ],
    name: "cancelCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "uint256[]", name: "_timeSlots", type: "uint256[]" },
      { internalType: "uint256[]", name: "_timePeriods", type: "uint256[]" },
      { internalType: "uint256[]", name: "_pricing", type: "uint256[]" },
      { internalType: "bool", name: "_karmaGatingEnabled", type: "bool" },
      { internalType: "string", name: "_profileMetadata", type: "string" },
    ],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
    ],
    name: "deleteProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
    ],
    name: "getAllBookigs",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "bookingId", type: "uint256" },
          {
            internalType: "uint256",
            name: "bookerFarcasterId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "profileFarcasterId",
            type: "uint256",
          },
          { internalType: "uint256", name: "timeStart", type: "uint256" },
          { internalType: "uint256", name: "timePeriod", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint8", name: "day", type: "uint8" },
          { internalType: "uint8", name: "month", type: "uint8" },
          { internalType: "uint16", name: "year", type: "uint16" },
          { internalType: "bool", name: "exists", type: "bool" },
        ],
        internalType: "struct CalCast.Booking[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
    ],
    name: "getProfile",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "farcasterId", type: "uint256" },
          { internalType: "uint256[]", name: "timeSlots", type: "uint256[]" },
          {
            internalType: "uint256[]",
            name: "timePeriods",
            type: "uint256[]",
          },
          { internalType: "uint256[]", name: "pricing", type: "uint256[]" },
          { internalType: "string", name: "profileMetadata", type: "string" },
          { internalType: "bool", name: "karmaGatingEnabled", type: "bool" },
          { internalType: "bool", name: "exists", type: "bool" },
        ],
        internalType: "struct CalCast.Profile",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "onlyOwnerEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "profiles",
    outputs: [
      { internalType: "uint256", name: "farcasterId", type: "uint256" },
      { internalType: "string", name: "profileMetadata", type: "string" },
      { internalType: "bool", name: "karmaGatingEnabled", type: "bool" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_onlyOwnerEnabled", type: "bool" }],
    name: "setOnlyOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalBookings",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalProfiles",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_bookingPeriodLimit",
        type: "uint256",
      },
    ],
    name: "updateBookingPeriodLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "bool", name: "_karmaGatingEnabled", type: "bool" },
    ],
    name: "updateKarmaGating",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "uint256[]", name: "_pricing", type: "uint256[]" },
    ],
    name: "updatePricing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "uint256[]", name: "_timeSlots", type: "uint256[]" },
      { internalType: "uint256[]", name: "_timePeriods", type: "uint256[]" },
      { internalType: "uint256[]", name: "_pricing", type: "uint256[]" },
      { internalType: "bool", name: "_karmaGatingEnabled", type: "bool" },
      { internalType: "string", name: "_profileMetadata", type: "string" },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "string", name: "_profileMetadata", type: "string" },
    ],
    name: "updateProfileMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "uint256[]", name: "timePeriods", type: "uint256[]" },
    ],
    name: "updateProfileTimePeriods",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_farcasterId", type: "uint256" },
      { internalType: "uint256[]", name: "_timeSlots", type: "uint256[]" },
    ],
    name: "updateProfileTimeSlots",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
