// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthcareFunding {
    address public owner;

    struct Request {
        address payable patient;
        uint256 amount;
        string reason;
        string reportHash;
        uint256 deadline;
        bool approved;
        bool rejected;
        bool funded;
    }

    Request[] public requests;
    mapping(address => uint256[]) public patientRequests;
    mapping(uint256 => mapping(address => uint256)) private requestDonations;
    mapping(address => uint256) public totalDonations;
    mapping(uint256 => address[]) public donorsPerRequest;
    uint256 public generalDonationPool;

    event RequestCreated(address indexed patient, uint256 index);
    event RequestApproved(uint256 indexed index);
    event RequestRejected(uint256 indexed index);
    event Donated(address indexed donor, uint256 indexed requestIndex, uint256 amount);
    event Funded(uint256 indexed index);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized (admin only)");
        _;
    }

    function createRequest(uint256 _amount, string memory _reason, string memory _reportHash, uint256 _duration) public {
        require(_amount > 0, "Invalid amount");
        require(_duration > 0, "Invalid duration");

        Request memory newReq = Request({
            patient: payable(msg.sender),
            amount: _amount,
            reason: _reason,
            reportHash: _reportHash,
            deadline: block.timestamp + _duration,
            approved: false,
            rejected: false,
            funded: false
        });

        requests.push(newReq);
        uint256 index = requests.length - 1;
        patientRequests[msg.sender].push(index);

        emit RequestCreated(msg.sender, index);
    }

    function approveRequest(uint256 _index) public onlyOwner {
        require(_index < requests.length, "Request does not exist");
        require(!requests[_index].approved, "Already approved");
        requests[_index].approved = true;
        emit RequestApproved(_index);
    }

    function rejectRequest(uint256 _index) public onlyOwner {
        require(!requests[_index].funded, "Already funded");
        requests[_index].rejected = true;
        emit RequestRejected(_index);
    }

    function donateToRequest(uint256 _index) public payable {
        Request storage req = requests[_index];

        require(msg.value > 0, "Zero donation");
        require(!req.funded, "Request already funded");
        require(!req.rejected, "Request rejected");

        uint256 currentTotal = getRequestTotalDonation(_index);
        require(currentTotal < req.amount, "Request already fully funded");

        uint256 donationAmount = msg.value;

        if (currentTotal + msg.value > req.amount) {
            donationAmount = req.amount - currentTotal;
            uint256 refund = msg.value - donationAmount;
            payable(msg.sender).transfer(refund);
        }

        if (requestDonations[_index][msg.sender] == 0) {
            donorsPerRequest[_index].push(msg.sender);
        }

        requestDonations[_index][msg.sender] += donationAmount;
        totalDonations[msg.sender] += donationAmount;
        emit Donated(msg.sender, _index, donationAmount);
    }

    function donateToPool() public payable {
        require(msg.value > 0, "Zero donation");
        generalDonationPool += msg.value;
        totalDonations[msg.sender] += msg.value;
    }

    function fundPatient(uint256 _index) public onlyOwner {
        Request storage req = requests[_index];

        require(req.approved, "Not approved");
        require(!req.funded, "Already funded");
        require(!req.rejected, "Rejected request");
        require(block.timestamp <= req.deadline, "Deadline passed");

        uint256 totalRequestDonated = getRequestTotalDonation(_index);
        uint256 amountNeeded = req.amount;
        require(address(this).balance >= amountNeeded, "Insufficient contract balance");

        if (totalRequestDonated < amountNeeded) {
            uint256 requiredFromPool = amountNeeded - totalRequestDonated;
            require(generalDonationPool >= requiredFromPool, "Insufficient general pool");
            generalDonationPool -= requiredFromPool;
        }

        req.patient.transfer(req.amount);
        req.funded = true;
        emit Funded(_index);
    }

    function getRequestTotalDonation(uint256 _index) public view returns (uint256 total) {
        address[] memory donors = donorsPerRequest[_index];
        total = 0;
        for (uint256 i = 0; i < donors.length; i++) {
            total += requestDonations[_index][donors[i]];
        }
    }

    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPatientRequestIndexes(address _patient) public view returns (uint256[] memory) {
        return patientRequests[_patient];
    }

    function getRequest(uint256 _index) public view returns (Request memory) {
        return requests[_index];
    }

    function getRequestDonationFromAddress(uint256 _index, address _donor) public view returns (uint256) {
        return requestDonations[_index][_donor];
    }
}
