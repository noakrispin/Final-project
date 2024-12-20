import PropTypes from 'prop-types';

// PropTypes for the BlurElements component
export const blurElementsPropTypes = {
  className: PropTypes.string
};

// PropTypes for the ProjectDetailsDialog component
export const projectDetailsPropTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    projectCode: PropTypes.string.isRequired,
    part: PropTypes.string.isRequired,
    supervisor: PropTypes.string.isRequired,
    supervisorTopics: PropTypes.arrayOf(PropTypes.string),
    students: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired
      })
    ).isRequired
  })
};

// PropTypes for the SearchBar component
export const searchBarPropTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

// PropTypes for the MobileMenu component
export const mobileMenuPropTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

// PropTypes for the ErrorMessage component
export const errorMessagePropTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

// PropTypes for the Section component
export const sectionPropTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.string),
  filterState: PropTypes.arrayOf(PropTypes.any), // [activeFilter, setActiveFilter]
  searchState: PropTypes.arrayOf(PropTypes.any), // [searchTerm, setSearchTerm]
  progressBar: PropTypes.node,
  tableData: PropTypes.array.isRequired,
  tableColumns: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

