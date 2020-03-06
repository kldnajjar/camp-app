import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";

import {
  getProfilesPerPage,
  getProfilesFilteredBy
} from "../../../services/profileService";
import { loader } from "../../../actions/loaderAction";
import Table from "./table";
import Add from "./add";
import Delete from "./delete";
// import Edit from "./edit";

class Tents extends Component {
  state = {
    data: null,

    pageLimit: 30,
    currentPage: 1,
    search: {
      isActive: true,
      dropDownOpened: false,
      searchQuery: "",
      filter: {
        searchBy: "Name",
        path: "name_like",
        type: "text"
      }
    },
    sortColumn: { path: "name", order: "asc" },
    selectedItem: { id: null, name: "" },

    showAddModal: false,
    showDeleteModal: false,

    errors: {}
  };

  loading = true;

  info = {
    name: "Tents",
    addButton: "Add"
  };

  async componentDidMount() {
    const { currentPage, pageLimit, sortColumn, errors: errs } = this.state;

    try {
      setTimeout(() => {
        this.props.dispatch(loader(true));
      }, 200);

      const data = await getProfilesPerPage(currentPage, pageLimit, sortColumn);
      this.setState({ data });
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
      }, 500);
    }
  }

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
      const data = await getProfilesFilteredBy(
        1,
        pageLimit,
        sortColumn,
        search
      );
      this.setState({ data, sortColumn, search, currentPage: 1 });
    } catch (err) {
      if (err.response) toast.error(err.response.data.error.message);
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
    if (this.loading) return (this.loading = false);

    const { pageLimit, sortColumn, search } = this.state;
    try {
      await this.props.dispatch(loader(true));
      const currentPage = page.selected + 1;
      const data = await getProfilesFilteredBy(
        currentPage,
        pageLimit,
        sortColumn,
        search
      );

      this.setState({ data, currentPage });
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

  render() {
    const {
      data,
      sortColumn,
      search,
      pageLimit,
      currentPage,
      showAddModal,
      showDeleteModal,
      selectedItem
    } = this.state;
    if (!data) return null;

    return (
      <React.Fragment>
        <Table
          data={data.result}
          sortColumn={sortColumn}
          onAdd={this.addModalHandler}
          search={search}
          onSearchChange={this.onSearchChange}
          onSearch={this.searchHandler}
          onToggleSearch={this.toggleSearch}
          searchByType={this.searchByType}
          itemCounts={data.counts}
          pageLimit={pageLimit}
          currentPage={currentPage}
          onPageChange={this.handlePagination}
          onDelete={this.showDeleteConfirmationModal}
          onShow={this.showHandler}
          onEdit={this.editHandler}
          onSort={this.sortHandler}
          info={this.info}
        />

        <Add showModal={showAddModal} onToggle={this.addModalHandler} />

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

export default connect(mapStateToProps, mapDispatchToProps)(Tents);
