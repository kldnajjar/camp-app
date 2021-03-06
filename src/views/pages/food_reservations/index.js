import React from "react";
import { connect } from "react-redux";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import { animateScroll, scroller } from "react-scroll";
import moment from "moment";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  Row,
  Button,
  Collapse
} from "reactstrap";

import {
  getProfiles,
  getProfilesPerPage,
  getProfilesFilteredBy,
  deleteProfile,
  getProfilesByFilters,
  updateReservationStatus
} from "../../../services/profileService";
import { loader } from "../../../actions/loaderAction";
import FormWrapper from "../../../components/common/form";
import { exposeFilteration } from "./logic/filteration";

import Table from "./table";
import Add from "./add";
import Delete from "./delete";
// import Edit from "./edit";

class FoodReservations extends FormWrapper {
  state = {
    data: null,
    advanceSearch: {
      id: null,
      price: null,
      reservation_type: null,
      meal_type_id: null,
      food_ids: [],
      contact_name: null,
      contact_number: null,
      contact_email: null,
      guests_count: null,
      reservation_date: null,

      status: null,
      company_id: null,
      notes: null,
      reservation_number: null,

      created_at: null,
      updated_at: null
    },
    meal_types_options: [],
    food_options: [],
    company_options: [],
    pageLimit: 30,
    currentPage: 1,
    search: {
      isActive: true,
      dropDownOpened: false,
      searchQuery: "",
      filter: {
        searchBy: "Document Number",
        path: "document_number",
        type: "text"
      }
    },
    sortColumn: { path: "created_at", order: "desc" },
    selectedItem: { id: null, name: "" },
    count: null,

    searchCollapse: false,

    showAddModal: false,
    showDeleteModal: false,

    isResultRequested: false,

    errors: {}
  };

  isPaginated = true;

  reset = {
    advanceSearch: {}
  };

  schema = {
    food: Joi.label("Delete this when razz delete it"),
    id: Joi.label("Document Number"),
    price: Joi.label("Price"),
    reservation_type: Joi.label("Reservation Type"),
    meal_type_id: Joi.label("Meal Type"),
    food_ids: Joi.label("Food"),
    contact_name: Joi.label("Contact Name"),
    contact_number: Joi.label("Contact Number"),
    contact_email: Joi.label("Contact Email"),
    guests_count: Joi.label("Guests Count"),
    reservation_date: Joi.label("Reservation Date"),
    company_id: Joi.label("Company Name"),
    reservation_number: Joi.label("Reservation Number"),
    status: Joi.label("Reservation Status"),
    notes: Joi.label("Notes"),

    created_at: Joi.label("created_at"),
    updated_at: Joi.label("updated_at")
  };

  url = "/dashboard/food_reservations";

  info = {
    name: "Food Reservations",
    addButton: "Add"
  };

  reservation_type_options = [
    {
      id: "company",
      name: "Company"
    },
    {
      id: "individual",
      name: "Individual"
    }
  ];

  status_options = [
    {
      id: "booked",
      name: "Booked"
    },
    {
      id: "cancelled",
      name: "Cancelled"
    },
    {
      id: "confirmed",
      name: "Confirmed"
    }
  ];

  collapseIcons = {
    false: "fa fa-chevron-circle-down",
    true: "fa fa-chevron-circle-up"
  };

  async componentDidMount() {
    const { currentPage, pageLimit, sortColumn, errors: errs } = this.state;
    try {
      setTimeout(() => {
        this.props.dispatch(loader(true));
      }, 200);

      this.initResetVariable();

      const { isDashboard } = this.props;
      let extraOptions = null;
      if (isDashboard)
        extraOptions = `reservation_date=${moment().format("YYYY-MM-DD")}`;

      const { results: data, count } = await getProfilesPerPage(
        currentPage,
        pageLimit,
        sortColumn,
        "food_reservations",
        extraOptions
      );
      if (data.company) {
        data.company.id = data.company.id.toString();
      } else {
        data.company_id = data.company;
      }
      delete data.company;

      const { results: meal_types_options } = await getProfiles("meal_types");
      const { results: food_options } = await getProfiles("food");
      const { results: company_options } = await getProfiles("companies");

      this.setState({
        data,
        meal_types_options,
        food_options,
        company_options,
        count
      });
    } catch (err) {
      if (err.response) {
        const errors = { ...errs };
        const details = err.response.data.details;

        let key;
        for (key in details) {
          if (details.hasOwnProperty(key)) {
            errors[key] = details[key];
          }
        }

        this.setState({ errors });
        if (err.response.data.msg) toast.error(err.response.data.msg);
      }
    } finally {
      setTimeout(() => {
        this.props.dispatch(loader(false));
      }, 500);
    }
  }

  initResetVariable = () => {
    const { advanceSearch } = this.state;
    this.reset.advanceSearch = { ...advanceSearch };
  };

  editHandler = id => {
    this.props.history.push(`${this.url}/${id}`);
  };

  sortHandler = async sortColumn => {
    const { pageLimit } = this.state;
    try {
      await this.props.dispatch(loader(true));

      const { isDashboard } = this.props;
      let extraOptions = null;
      if (isDashboard)
        extraOptions = `reservation_date=${moment().format("YYYY-MM-DD")}`;

      const { results: data, count } = await getProfilesPerPage(
        1,
        pageLimit,
        sortColumn,
        "food_reservations",
        extraOptions
      );
      this.setState({ data, sortColumn, currentPage: 1, count });
    } catch (err) {
      if (err.response)
        if (err.response.data.msg) toast.error(err.response.data.msg);
    } finally {
      await this.props.dispatch(loader(false));
    }
  };

  onSearchChange = searchQuery => {
    const { search: oldSearch } = this.state;
    const search = { ...oldSearch };
    search.searchQuery = searchQuery;
    this.setState({ search });
  };

  searchHandler = async e => {
    e.preventDefault();
    try {
      const { sortColumn, pageLimit, search } = this.state;
      await this.props.dispatch(loader(true));
      const { results: data, count } = await getProfilesFilteredBy(
        1,
        pageLimit,
        sortColumn,
        search
      );
      this.setState({ data, sortColumn, search, currentPage: 1, count });
    } catch (err) {
      if (err.response)
        if (err.response.data.msg) toast.error(err.response.data.msg);
    } finally {
      await this.props.dispatch(loader(false));
    }
  };

  searchByType = item => {
    const search = { ...this.state.search };
    search.filter = item.filter;
    search.filter.searchBy = item.label;
    search.searchQuery = "";
    this.setState({ search });
  };

  toggleSearch = () => {
    const search = { ...this.state.search };
    search.dropDownOpened = !search.dropDownOpened;
    this.setState({ search });
  };

  handlePagination = async page => {
    if (!this.isPaginated) return (this.isPaginated = true);

    const { pageLimit, sortColumn, search } = this.state;
    try {
      await this.props.dispatch(loader(true));
      const currentPage = page.selected + 1;
      const { results: data, count } = await getProfilesFilteredBy(
        currentPage,
        pageLimit,
        sortColumn,
        search
      );
      if (data.company) {
        data.company.id = data.company.id.toString();
      } else {
        data.company_id = data.company;
      }
      delete data.company;

      this.setState({ data, currentPage, count });
    } catch (err) {
    } finally {
      await this.props.dispatch(loader(false));
    }
  };

  addModalHandler = () => {
    this.setState({ showAddModal: !this.state.showAddModal });
  };

  showDeleteConfirmationModal = (id, name) => {
    const { selectedItem: info } = this.state;
    const selectedItem = { ...info };
    selectedItem.id = id;
    selectedItem.name = name;
    this.setState({ selectedItem, showDeleteModal: true });
  };

  deleteModalHandler = () => {
    this.setState({ showDeleteModal: !this.state.showDeleteModal });
  };

  deleteHandler = async id => {
    let {
      data: oldData,
      currentPage,
      pageLimit,
      sortColumn,
      selectedItem: info
    } = this.state;
    try {
      this.deleteModalHandler();
      await this.props.dispatch(loader(true));
      await deleteProfile(id);
      const pagesCount = Math.ceil((oldData.totalNumber - 1) / pageLimit);
      if (pagesCount < currentPage && pagesCount !== 0) {
        currentPage = pagesCount;
      }

      const { isDashboard } = this.props;
      let extraOptions = null;
      if (isDashboard)
        extraOptions = `reservation_date=${moment().format("YYYY-MM-DD")}`;

      const { results: data, count } = await getProfilesPerPage(
        currentPage,
        pageLimit,
        sortColumn,
        "food_reservations",
        extraOptions
      );
      const selectedItem = { ...info };
      selectedItem.id = {};
      selectedItem.name = "";

      this.setState({ data, currentPage, selectedItem, count });
      toast.success("Profile deleted");
    } catch (err) {
      if (err.response)
        if (err.response.data.msg) toast.error(err.response.data.msg);
    } finally {
      await this.props.dispatch(loader(false));
    }
  };

  toggleSearchCollapse = () => {
    const { searchCollapse } = this.state;
    this.setState({ searchCollapse: !searchCollapse });
  };

  resetHandler = async () => {
    const advanceSearch = { ...this.reset.advanceSearch };
    await this.props.dispatch(loader(true));

    this.setState({
      advanceSearch,
      isResultRequested: false,
      errors: {}
    });
    this.props.history.push();
    animateScroll.scrollTo(0);
    setTimeout(() => this.props.dispatch(loader(false)), 500);
  };

  handleAdvanceSearch = e => {
    e.preventDefault();

    const errors = this.validateByAdvanceSearch();
    this.setState({ errors: errors || {}, isChanged: false });
    if (errors) return;

    this.advanceSubmit(false);
  };

  advanceSubmit = async (isPrint = false) => {
    const {
      advanceSearch: oldData,
      pageLimit,
      sortColumn,
      errors: errs
    } = this.state;
    try {
      await this.props.dispatch(loader(true));
      const currentPage = 1;
      const filteredData = await exposeFilteration(oldData);
      const { isDashboard } = this.props;
      let extraOptions = null;
      if (isDashboard)
        extraOptions = `reservation_date=${moment().format("YYYY-MM-DD")}`;

      if (isPrint) {
        const { results: data } = await getProfilesByFilters(
          currentPage,
          99999,
          sortColumn,
          filteredData,
          "stay_reservations",
          extraOptions
        );

        this.printToPDF(data);
      }

      const { results: data } = await getProfilesByFilters(
        currentPage,
        pageLimit,
        sortColumn,
        filteredData
      );

      let searchCollapse = true;
      if (data.length) searchCollapse = false;
      else {
        setTimeout(() => {
          scroller.scrollTo("no-result", {
            duration: 800,
            delay: 0,
            smooth: "easeInOutQuart"
          });
        }, 300);
      }

      this.isPaginated = false;

      this.setState({
        data,
        searchCollapse,
        currentPage,
        isResultRequested: true
      });
      this.cloneStateToUrl();
    } catch (err) {
      if (err.response) {
        const errors = { ...errs };
        const details = err.response.data.error.details;
        let key;
        for (key in details) {
          if (details.hasOwnProperty(key)) {
            errors[key] = details[key];
          }
        }
        this.setState({ errors });
        toast.error(err.response.data.error.message);
      }
    } finally {
      setTimeout(() => {
        this.props.dispatch(loader(false));
      }, 200);
    }
  };

  printToPDF = data => {
    debugger;
    console.log(data);
  };

  validateByAdvanceSearch = () => {
    const options = { abortEarly: false };
    const result = Joi.validate(this.state.advanceSearch, this.schema, options);
    if (!result.error) return null;

    const errors = {};
    let item;
    for (item of result.error.details) errors[item.path] = item.message;

    return errors;
  };

  validatePropertyByAdvanceSearch = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleDatePickerChangeByAdvanceSearch = (
    name,
    timeDefaultFormat,
    storedType,
    displayType,
    dateFormatter
  ) => {
    const { advanceSearch, errors } = this.state;

    try {
      let timeValue = timeDefaultFormat;
      if (displayType === "date_time") {
        timeValue.hours = dateFormatter.getHours();
        timeValue.minutes = dateFormatter.getMinutes();
        timeValue.seconds = dateFormatter.getSeconds();
        timeValue.milliseconds = dateFormatter.getMilliseconds();
      }

      const value = new Date(
        dateFormatter.getFullYear(),
        dateFormatter.getMonth(),
        dateFormatter.getDate(),
        timeValue.hours,
        timeValue.minutes,
        timeValue.seconds,
        timeValue.milliseconds
      );

      const input = { value, name };
      const errorMsg = this.validatePropertyByAdvanceSearch(input);
      if (errorMsg) errors[input.name] = errorMsg;
      else delete errors[input.name];

      if (storedType === "date_time")
        advanceSearch[input.name] = moment(input.value).format(
          "YYYY-MM-DDTHH:mm:ss.SSS"
        );
      else if (storedType === "date_only")
        advanceSearch[input.name] = moment(input.value).format("YYYY-MM-DD");

      this.setState({ advanceSearch, isChanged: true, errors });
    } catch (error) {
      advanceSearch[name] = null;
      this.setState({ advanceSearch, isChanged: false, errors });
    }
  };

  handleMultiSelectChangeByAdvanceSearch = (name, value) => {
    const { advanceSearch } = this.state;
    advanceSearch[name] = value;
    this.setState({ advanceSearch, isChanged: true });
  };

  handleChangeByAdvanceSearch = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMsg = this.validatePropertyByAdvanceSearch(input);
    if (errorMsg) errors[input.name] = errorMsg;
    else delete errors[input.name];

    const { advanceSearch } = this.state;
    advanceSearch[input.name] = input.value;

    this.setState({ advanceSearch, errors, isChanged: true });
  };

  confirmReservation = async id => {
    const status = "confirmed";
    this.setState({ status });

    try {
      setTimeout(() => {
        this.props.dispatch(loader(true));
      }, 200);
      await updateReservationStatus({ status }, id, "food_reservations");

      const extraOptions = `reservation_date=${moment().format("YYYY-MM-DD")}`;
      const { currentPage, pageLimit, sortColumn } = this.state;
      const { results: data, count } = await getProfilesPerPage(
        currentPage,
        pageLimit,
        sortColumn,
        "food_reservations",
        extraOptions
      );

      this.setState({ data, count });
    } catch (err) {
      if (err.response) {
        if (err.response.data.msg) toast.error(err.response.data.msg);
      }
    } finally {
      setTimeout(() => {
        this.props.dispatch(loader(false));
      }, 500);
    }
  };

  cancelReservation = async id => {
    const status = "cancelled";
    this.setState({ status });

    try {
      setTimeout(() => {
        this.props.dispatch(loader(true));
      }, 200);
      await updateReservationStatus({ status }, id, "food_reservations");

      const extraOptions = `reservation_date=${moment().format("YYYY-MM-DD")}`;
      const { currentPage, pageLimit, sortColumn } = this.state;
      const { results: data, count } = await getProfilesPerPage(
        currentPage,
        pageLimit,
        sortColumn,
        "food_reservations",
        extraOptions
      );

      this.setState({ data, count });
    } catch (err) {
      if (err.response) {
        if (err.response.data.msg) toast.error(err.response.data.msg);
      }
    } finally {
      setTimeout(() => {
        this.props.dispatch(loader(false));
      }, 500);
    }
  };

  getAdvanceSearch = () => {
    const {
      advanceSearch,
      meal_types_options,
      food_options,
      company_options,
      searchCollapse
    } = this.state;
    return (
      <React.Fragment>
        <Row>
          <Col>
            <Card>
              <CardHeader
                onClick={this.toggleSearchCollapse}
                className="clickable hover-background"
              >
                <i
                  className={`${this.collapseIcons[searchCollapse]} fa-20px mr-2`}
                ></i>
                <strong>Advance Search</strong>
              </CardHeader>
              <Collapse isOpen={searchCollapse} id="basicSearch">
                <form onSubmit={this.handleAdvanceSearch}>
                  <CardBody>
                    <Row>
                      <Col md="2">
                        {this.renderInput(
                          "id",
                          "Document Number",
                          "",
                          "",
                          "",
                          "text",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderSelect(
                          "reservation_type",
                          "Reservation Type",
                          this.reservation_type_options,
                          "choose a value",
                          false,
                          this.handleChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderSelect(
                          "status",
                          "Reservation Status",
                          this.status_options,
                          "choose a value",
                          false,
                          this.handleChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderDatePicker(
                          "reservation_date",
                          "Reservation Date",
                          "Select a date",
                          false,
                          "date_only",
                          "date_only",
                          {
                            hours: "00",
                            minutes: "00",
                            seconds: "00",
                            milliseconds: "000"
                          },
                          null,
                          this.handleDatePickerChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderDatePicker(
                          "created_at",
                          "Created At",
                          "Select a date",
                          false,
                          "date_only",
                          "date_only",
                          {
                            hours: "00",
                            minutes: "00",
                            seconds: "00",
                            milliseconds: "000"
                          },
                          null,
                          this.handleDatePickerChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {this.renderSelect(
                          "company_id",
                          "Company",
                          company_options,
                          "choose company",
                          false,
                          this.handleChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderInput(
                          "reservation_number",
                          "Company Reservation Number",
                          "",
                          "",
                          "",
                          "text",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {this.renderInput(
                          "contact_name",
                          "Contact Name",
                          "",
                          "",
                          "",
                          "text",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderInput(
                          "contact_number",
                          "Contact Number",
                          "",
                          "",
                          "",
                          "text",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderInput(
                          "contact_email",
                          "Contact Email",
                          "",
                          "",
                          "",
                          "text",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        {this.renderInput(
                          "guests_count",
                          "Guests Count",
                          "",
                          "",
                          "",
                          "number",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderInput(
                          "price",
                          "Price",
                          "",
                          "",
                          "",
                          "number",
                          false,
                          false,
                          this.handleChangeByAdvanceSearch,
                          "off",
                          "",
                          advanceSearch
                        )}
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        {this.renderSelect(
                          "meal_type_id",
                          "Meal Type",
                          meal_types_options,
                          "Choose Meal",
                          false,
                          this.handleChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                      <Col>
                        {this.renderMultiSelect(
                          "food_ids",
                          "Food",
                          food_options,
                          "Choose Food",
                          this.handleMultiSelectChangeByAdvanceSearch,
                          advanceSearch
                        )}
                      </Col>
                    </Row>
                  </CardBody>

                  <CardFooter>
                    <Row>
                      <Col>
                        <Button
                          color="danger"
                          onClick={this.resetHandler}
                          className="ml-2"
                        >
                          Clear All
                        </Button>
                      </Col>
                      <Col className="text-right">
                        <button
                          className={`btn btn-dark mr-2`}
                          onClick={() => this.advanceSubmit(true)}
                        >
                          Print
                        </button>
                        <button type="submit" className={`btn btn-primary`}>
                          Search
                        </button>
                      </Col>
                    </Row>
                  </CardFooter>
                </form>
              </Collapse>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    );
  };

  render() {
    const {
      data,
      sortColumn,
      search,
      pageLimit,
      currentPage,
      showAddModal,
      showDeleteModal,
      selectedItem,
      count,
      meal_types_options,
      food_options,
      company_options
    } = this.state;
    if (!data) return null;

    const { isDashboard } = this.props;
    return (
      <React.Fragment>
        {!isDashboard && this.getAdvanceSearch()}
        <Table
          data={data}
          sortColumn={sortColumn}
          onAdd={this.addModalHandler}
          search={search}
          onSearchChange={this.onSearchChange}
          onSearch={this.searchHandler}
          onToggleSearch={this.toggleSearch}
          searchByType={this.searchByType}
          itemCounts={count}
          pageLimit={pageLimit}
          currentPage={currentPage}
          onPageChange={this.handlePagination}
          onDelete={this.showDeleteConfirmationModal}
          // onEdit={this.editHandler}
          onSort={this.sortHandler}
          info={this.info}
          meal_types_options={meal_types_options}
          food_options={food_options}
          company_options={company_options}
          reservation_type_options={this.reservation_type_options}
          confirmReservation={this.confirmReservation}
          cancelReservation={this.cancelReservation}
          isDashboard={isDashboard}
          isColored="true"
        />

        <Add
          showModal={showAddModal}
          onToggle={this.addModalHandler}
          url={this.url}
          meal_types_options={meal_types_options}
          food_options={food_options}
          company_options={company_options}
          reservation_type_options={this.reservation_type_options}
        />

        <Delete
          showModal={showDeleteModal}
          onToggle={this.deleteModalHandler}
          onDelete={this.deleteHandler}
          info={selectedItem}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ loaderReducer }) => ({
  loaderReducer
});

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(FoodReservations);
