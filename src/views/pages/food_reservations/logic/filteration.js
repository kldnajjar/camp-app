let stringBuffer = "";

const filteration = {
  id: {
    filter: {
      name: "document_number",
      param: ""
    }
  },
  price: {
    filter: {
      name: "price",
      param: ""
    }
  },
  reservation_type: {
    filter: {
      name: "reservation_type",
      param: ""
    }
  },
  meal_type_id: {
    filter: {
      name: "meal_type_id",
      param: ""
    }
  },
  food_ids: {
    filter: {
      name: "food_ids",
      param: ""
    }
  },
  contact_name: {
    filter: {
      name: "contact_name",
      param: ""
    }
  },
  contact_number: {
    filter: {
      name: "contact_number",
      param: ""
    }
  },
  contact_email: {
    filter: {
      name: "contact_email",
      param: ""
    }
  },
  guests_count: {
    filter: {
      name: "guests_count",
      param: ""
    }
  },
  reservation_date: {
    filter: {
      name: "reservation_date",
      param: ""
    }
  },

  status: {
    filter: {
      name: "status",
      param: ""
    }
  },
  company_id: {
    filter: {
      name: "company_id",
      param: ""
    }
  },
  notes: {
    filter: {
      name: "notes",
      param: ""
    }
  },
  reservation_number: {
    filter: {
      name: "reservation_number",
      param: ""
    }
  },
  created_at: {
    filter: {
      name: "created_at",
      param: ""
    }
  }
};

export async function exposeFilteration(data) {
  let filter;
  stringBuffer = "";
  Object.keys(data).map(item => {
    if (!filteration[item]) return null;

    filter = filteration[item].filter || "";
    switch (item) {
      case "food_ids":
        mapArrayData(data, item, filter);
        break;
      default:
        mapNormalData(data, item, filter);
    }

    return stringBuffer;
  });

  return stringBuffer.substring(0, stringBuffer.length - 1);
}

function mapNormalData(data, item, filter) {
  if (data[item] && data[item].length)
    stringBuffer += `${filter.name}${filter.param}=${data[item]}&`;
}

function mapArrayData(data, item, filter) {
  let values = "";

  data[item].map(item => (values += `${item.value},`));

  values = values.substring(0, values.length - 1);
  stringBuffer += `${filter.name}${filter.param}=${values}&`;
  return stringBuffer;
}

export default {
  exposeFilteration
};
