const { fetchRegisteredCompanies, fetchJobs, deleteCompany } = require("../controllers/adminDashboardController");
const { JobModel } = require("../models/JobModel");
const { CompanyModel } = require("../models/CompanyModel");

jest.mock("../models/JobModel");
jest.mock("../models/CompanyModel");

describe("Admin Dashboard Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      render: jest.fn(),
      status: jest.fn(() => res),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetchRegisteredCompanies fetches and renders companies", async () => {
    const mockCompanies = [
      { _id: "company1", name: "Company A", email: "email@example.com" },
    ];
    CompanyModel.find.mockResolvedValue(mockCompanies);

    await fetchRegisteredCompanies(req, res);

    expect(CompanyModel.find).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("adminDashBoard", { companies: mockCompanies });
  });

  test("fetchJobs fetches and renders jobs", async () => {
    const mockJobs = [
      { _id: "job1", title: "Job A", company_id: { name: "Company A" } },
    ];
    JobModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockJobs),
    });

    await fetchJobs(req, res);

    expect(JobModel.find).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("adminDashBoard", { jobs: mockJobs });
  });

  test("deleteCompany deletes a company by ID and redirects", async () => {
    req.params = { id: "company1" };
    CompanyModel.findByIdAndDelete.mockResolvedValue(true);

    await deleteCompany(req, res);

    expect(CompanyModel.findByIdAndDelete).toHaveBeenCalledWith("company1");
    expect(res.redirect).toHaveBeenCalledWith("/admin-dashboard/companies");
  });

  test("deleteCompany handles errors", async () => {
    req.params = { id: "company1" };
    CompanyModel.findByIdAndDelete.mockRejectedValue(new Error("Delete failed"));

    await deleteCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("error", { error: "Error deleting company." });
  });
});
