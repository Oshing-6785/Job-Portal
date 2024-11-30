const request = require("supertest");
const { mainRoutes, fetchRegisteredCompanies, fetchJobs, deleteCompany } = require("../controllers/adminDashboardController");
const { JobModel } = require("../models/JobModel");
const { ApplicationModel } = require("../models/ApplicationModel");
const { LogInModel } = require("../models/logInModel");

jest.mock("../models/JobModel");
jest.mock("../models/ApplicationModel");
jest.mock("../models/logInModel");

describe("Admin Controller", () => {
  // Mock `res` object
  const res = {
    render: jest.fn(),
    status: jest.fn().mockReturnThis(),
    redirect: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  test("mainRoutes renders admin dashboard", async () => {
    const req = {}; // Mock `req` object
    await mainRoutes(req, res);

    expect(res.render).toHaveBeenCalledWith("adminDashBoard");
  });

  test("fetchRegisteredCompanies fetches and renders companies", async () => {
    const req = {};
    const mockJobs = [
      {
        _id: "job1",
        document: "doc1.pdf",
        company_id: {
          _id: "company1",
          name: "Company A",
          email: "email@example.com",
          location: "City A",
        },
      },
    ];
    JobModel.find.mockResolvedValueOnce(mockJobs);

    await fetchRegisteredCompanies(req, res);

    expect(JobModel.find).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("adminDashBoard", {
      companies: [
        {
          _id: "company1",
          name: "Company A",
          email: "email@example.com",
          location: "City A",
          documents: ["/public/doc1.pdf"],
        },
      ],
    });
  });

  test("fetchJobs fetches and renders jobs", async () => {
    const req = {};
    const mockJobs = [
      { _id: "job1", title: "Job A", company_id: { name: "Company A" } },
    ];
    JobModel.find.mockResolvedValueOnce(mockJobs);

    await fetchJobs(req, res);

    expect(JobModel.find).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("adminDashBoard", { jobs: mockJobs });
  });

  test("deleteCompany deletes a company by ID and redirects", async () => {
    const req = { params: { id: "company1" } };
    LogInModel.findByIdAndDelete.mockResolvedValueOnce({});

    await deleteCompany(req, res);

    expect(LogInModel.findByIdAndDelete).toHaveBeenCalledWith("company1");
    expect(res.redirect).toHaveBeenCalledWith("/admin-dashboard/companies");
  });

  test("deleteCompany handles errors gracefully", async () => {
    const req = { params: { id: "company1" } };
    const error = new Error("Delete failed");
    LogInModel.findByIdAndDelete.mockRejectedValueOnce(error);

    await deleteCompany(req, res);

    expect(LogInModel.findByIdAndDelete).toHaveBeenCalledWith("company1");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("error", { error: "Error deleting company." });
  });
});
